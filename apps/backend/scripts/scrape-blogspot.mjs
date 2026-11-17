#!/usr/bin/env node
/**
 * Phase A — standalone scraper for the bubuh.id Blogger blog.
 *
 * The blog's site feed is set to "Short", so the JSON feed only exposes a
 * summary. Full post bodies have to come from each post's HTML page.
 *
 * Writes:
 *   database/seeds/stories.json  — metadata + raw article HTML
 *   database/seeds/media/        — every Blogger CDN image referenced
 *
 * No Strapi dependency: run it with plain `node`.
 */

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BLOG_URL = "https://www.bubuh.id";
const FEED_PAGE_SIZE = 150;
const CONCURRENCY = 4;
const REQUEST_DELAY_MS = 250;
const MAX_RETRIES = 3;
const USER_AGENT =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const seedDir = path.join(scriptDir, "..", "database", "seeds");
const mediaDir = path.join(seedDir, "media");
const outputFile = path.join(seedDir, "stories.json");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ------------------------------------------------------------------ fetch */

async function fetchWithRetry(url, { binary = false } = {}) {
	let lastError;
	for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
		try {
			const response = await fetch(url, {
				headers: { "User-Agent": USER_AGENT },
				redirect: "follow",
			});
			if (!response.ok) {
				throw new Error(`HTTP ${response.status} for ${url}`);
			}
			return binary
				? Buffer.from(await response.arrayBuffer())
				: await response.text();
		} catch (error) {
			lastError = error;
			if (attempt < MAX_RETRIES) {
				await sleep(500 * 2 ** (attempt - 1));
			}
		}
	}
	throw lastError;
}

/** Runs `worker` over `items` with a bounded number of in-flight requests. */
async function mapWithConcurrency(items, limit, worker) {
	const results = new Array(items.length);
	let cursor = 0;

	const runners = Array.from(
		{ length: Math.min(limit, items.length) },
		async () => {
			while (cursor < items.length) {
				const index = cursor;
				cursor += 1;
				results[index] = await worker(items[index], index);
				await sleep(REQUEST_DELAY_MS);
			}
		},
	);

	await Promise.all(runners);
	return results;
}

/* ------------------------------------------------------------------- feed */

/** Walks the paginated Blogger JSON feed and returns one record per post. */
async function fetchFeedEntries() {
	const entries = [];
	let startIndex = 1;
	let total = Number.POSITIVE_INFINITY;

	while (startIndex <= total) {
		const url = `${BLOG_URL}/feeds/posts/default?alt=json&max-results=${FEED_PAGE_SIZE}&start-index=${startIndex}`;
		const feed = JSON.parse(await fetchWithRetry(url)).feed;

		total = Number(feed["openSearch$totalResults"].$t);
		const pageEntries = feed.entry ?? [];
		if (pageEntries.length === 0) break;

		entries.push(...pageEntries);
		console.log(`  feed: ${entries.length}/${total}`);
		startIndex += pageEntries.length;
		await sleep(REQUEST_DELAY_MS);
	}

	return { entries, total };
}

/** `tag:blogger.com,1999:blog-<blog>.post-<id>` → `<id>` */
function parseBlogspotId(feedId) {
	const match = /\.post-(\d+)$/.exec(feedId);
	return match ? match[1] : feedId;
}

function parseFeedEntry(entry) {
	const alternate = (entry.link ?? []).find((link) => link.rel === "alternate");
	if (!alternate?.href) return null;

	const url = new URL(alternate.href);
	const slug = path.basename(url.pathname).replace(/\.html$/, "");

	return {
		blogspotId: parseBlogspotId(entry.id.$t),
		title: entry.title.$t.trim(),
		slug,
		blogspotUrl: alternate.href,
		blogspotPath: url.pathname,
		publishedDate: entry.published.$t,
		updatedDate: entry.updated?.$t ?? null,
		labels: (entry.category ?? []).map((category) => category.term),
		commentCount: Number(entry["thr$total"]?.$t ?? 0),
		author: entry.author?.[0]?.name?.$t ?? null,
		feedThumbnail: entry["media$thumbnail"]?.url ?? null,
		feedSummary: normaliseWhitespace(stripTags(entry.summary?.$t ?? "")),
	};
}

/* ------------------------------------------------------------------- html */

function stripTags(html) {
	return html
		.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
		.replace(/<[^>]+>/g, " ");
}

function decodeEntities(text) {
	const named = {
		amp: "&",
		lt: "<",
		gt: ">",
		quot: '"',
		apos: "'",
		nbsp: " ",
	};
	return text
		.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
		.replace(/&#x([0-9a-f]+);/gi, (_, code) =>
			String.fromCharCode(parseInt(code, 16)),
		)
		.replace(
			/&([a-z]+);/gi,
			(match, name) => named[name.toLowerCase()] ?? match,
		);
}

function normaliseWhitespace(text) {
	return decodeEntities(text).replace(/\s+/g, " ").trim();
}

/**
 * Extracts the inner HTML of `<div itemprop='articleBody'>`.
 *
 * Post bodies are full of nested `<div>`s, so a non-greedy regex would stop at
 * the first `</div>`. Count opening and closing div tags instead.
 */
function extractArticleBody(html) {
	const open = /<div\b[^>]*itemprop=['"]articleBody['"][^>]*>/i.exec(html);
	if (!open) return null;

	const start = open.index + open[0].length;
	const tagPattern = /<(\/?)div\b[^>]*>/gi;
	tagPattern.lastIndex = start;

	let depth = 1;
	let match = tagPattern.exec(html);
	while (match !== null) {
		depth += match[1] === "/" ? -1 : 1;
		if (depth === 0) return html.slice(start, match.index);
		match = tagPattern.exec(html);
	}

	// Unbalanced markup: keep what we have rather than dropping the post.
	return html.slice(start);
}

function extractMeta(html, attribute, value) {
	const pattern = new RegExp(
		`<meta[^>]*${attribute}=['"]${value}['"][^>]*>`,
		"i",
	);
	const tag = pattern.exec(html)?.[0];
	if (!tag) return null;
	const content = /content=['"]([^'"]*)['"]/i.exec(tag)?.[1];
	return content ? decodeEntities(content).trim() : null;
}

function absoluteUrl(url) {
	if (url.startsWith("//")) return `https:${url}`;
	return url;
}

/** Blogger serves sized derivatives; `/s1600/` asks for the full-size one. */
function upgradeBloggerImage(url) {
	return url.replace(/\/(s\d+(-c)?|w\d+-h\d+(-[a-z-]+)?)\//, "/s1600/");
}

function isBloggerImage(url) {
	return (
		/(^https?:)?\/\/(\d+\.)?bp\.blogspot\.com\//.test(url) ||
		/(^https?:)?\/\/blogger\.googleusercontent\.com\//.test(url) ||
		/(^https?:)?\/\/lh\d+\.googleusercontent\.com\//.test(url)
	);
}

/** Drops scripts, inline event handlers and Blogger's lazy-load placeholders. */
function cleanArticleHtml(html) {
	return (
		html
			.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
			.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "")
			// The Blogger theme injects twitter:* meta tags inside the post body.
			.replace(/<meta\b[^>]*>/gi, "")
			.replace(/\son[a-z]+=(['"])[\s\S]*?\1/gi, "")
			.replace(
				/<img\b[^>]*resources\.blogblog\.com\/img\/blank\.gif[^>]*>/gi,
				"",
			)
			.replace(/(src|href)=(['"])\/\//gi, "$1=$2https://")
			.replace(/\n{3,}/g, "\n\n")
			.trim()
	);
}

function collectImageUrls(html) {
	const urls = new Set();
	const pattern = /<img\b[^>]*\bsrc=['"]([^'"]+)['"]/gi;
	let match = pattern.exec(html);
	while (match !== null) {
		const url = absoluteUrl(match[1]);
		if (isBloggerImage(url)) urls.add(url);
		match = pattern.exec(html);
	}
	return [...urls];
}

/* ------------------------------------------------------------------ media */

function mediaFileName(url, contentType) {
	const hash = createHash("sha1").update(url).digest("hex");
	const fromUrl = path.extname(new URL(url).pathname).toLowerCase();
	const fromType = contentType
		? `.${contentType.split("/")[1]?.split(";")[0]}`
		: "";
	const extension = /^\.(jpe?g|png|gif|webp|avif|svg)$/.test(fromUrl)
		? fromUrl
		: /^\.(jpe?g|png|gif|webp|avif|svg)$/.test(fromType)
			? fromType
			: ".jpg";
	return `${hash}${extension}`;
}

async function downloadImage(url, existingFiles) {
	const hash = createHash("sha1").update(url).digest("hex");
	const cached = existingFiles.find((file) => file.startsWith(hash));
	if (cached) return { originalUrl: url, localFile: cached, cached: true };

	const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
	if (!response.ok) throw new Error(`HTTP ${response.status}`);

	const buffer = Buffer.from(await response.arrayBuffer());
	const fileName = mediaFileName(url, response.headers.get("content-type"));
	await writeFile(path.join(mediaDir, fileName), buffer);
	existingFiles.push(fileName);

	return { originalUrl: url, localFile: fileName, cached: false };
}

/* ------------------------------------------------------------------- main */

async function scrapePost(post) {
	const html = await fetchWithRetry(post.blogspotUrl);
	const body = extractArticleBody(html);
	if (!body) throw new Error("articleBody not found");

	const content = cleanArticleHtml(body);
	const contentText = normaliseWhitespace(stripTags(content));
	const ogImage = extractMeta(html, "property", "og:image");
	const description =
		extractMeta(html, "name", "description") ?? post.feedSummary ?? null;

	const thumbnailUrl = ogImage
		? absoluteUrl(ogImage)
		: post.feedThumbnail
			? upgradeBloggerImage(absoluteUrl(post.feedThumbnail))
			: null;

	return {
		...post,
		excerpt: description ? description.slice(0, 500) : null,
		metaDescription: description,
		thumbnailUrl,
		content,
		contentText,
		imageUrls: collectImageUrls(content),
	};
}

async function main() {
	await mkdir(mediaDir, { recursive: true });

	console.log("1/3  Reading feed…");
	const { entries, total } = await fetchFeedEntries();
	let posts = entries.map(parseFeedEntry).filter(Boolean);

	const skippedEntries = entries.length - posts.length;
	if (skippedEntries > 0) {
		console.warn(
			`     ${skippedEntries} entries had no alternate link; skipped`,
		);
	}

	// `--limit N` keeps smoke tests from hammering the blog 219 times.
	const limitArg = process.argv.indexOf("--limit");
	if (limitArg !== -1 && process.argv[limitArg + 1]) {
		posts = posts.slice(0, Number(process.argv[limitArg + 1]));
		console.log(`     limited to ${posts.length} posts`);
	}

	// Blogger reuses a slug when the same title is posted in different months,
	// but `slug` is a unique uid in Strapi. Oldest post keeps the bare slug;
	// later collisions get a deterministic `-YYYY-MM` suffix. The original URL
	// stays in `blogspotPath`, so redirects are unaffected.
	posts.sort((a, b) => a.publishedDate.localeCompare(b.publishedDate));

	const taken = new Set();
	for (const post of posts) {
		if (!taken.has(post.slug)) {
			taken.add(post.slug);
			continue;
		}
		const [, year, month] =
			/^\/(\d{4})\/(\d{2})\//.exec(post.blogspotPath) ?? [];
		let candidate = year ? `${post.slug}-${year}-${month}` : `${post.slug}-2`;
		let counter = 2;
		while (taken.has(candidate)) {
			candidate = `${post.slug}-${counter}`;
			counter += 1;
		}
		console.warn(
			`     slug collision: ${post.slug} → ${candidate} (${post.blogspotPath})`,
		);
		post.slug = candidate;
		taken.add(candidate);
	}

	console.log(`2/3  Scraping ${posts.length} post pages…`);
	const failures = [];
	const scraped = [];

	await mapWithConcurrency(posts, CONCURRENCY, async (post, index) => {
		try {
			const result = await scrapePost(post);
			scraped.push(result);
			if ((index + 1) % 20 === 0) {
				console.log(`     ${index + 1}/${posts.length}`);
			}
		} catch (error) {
			failures.push({
				slug: post.slug,
				reason: String(error.message ?? error),
			});
		}
	});

	console.log("3/3  Downloading images…");
	const existingFiles = existsSync(mediaDir) ? await readdir(mediaDir) : [];
	const allUrls = new Set();
	for (const post of scraped) {
		if (post.thumbnailUrl && isBloggerImage(post.thumbnailUrl)) {
			allUrls.add(post.thumbnailUrl);
		}
		for (const url of post.imageUrls) allUrls.add(url);
	}

	const imageMap = new Map();
	const imageFailures = [];
	let cachedCount = 0;

	await mapWithConcurrency([...allUrls], CONCURRENCY, async (url) => {
		try {
			const result = await downloadImage(url, existingFiles);
			imageMap.set(url, result.localFile);
			if (result.cached) cachedCount += 1;
		} catch (error) {
			// A dead image must not cost us the whole post.
			imageFailures.push({ url, reason: String(error.message ?? error) });
		}
	});

	const stories = scraped
		.sort((a, b) => a.publishedDate.localeCompare(b.publishedDate))
		.map(({ imageUrls, feedThumbnail, feedSummary, ...post }) => ({
			...post,
			images: imageUrls
				.filter((url) => imageMap.has(url))
				.map((url) => ({ originalUrl: url, localFile: imageMap.get(url) })),
			thumbnailFile: post.thumbnailUrl
				? (imageMap.get(post.thumbnailUrl) ?? null)
				: null,
		}));

	await writeFile(outputFile, `${JSON.stringify(stories, null, 2)}\n`, "utf8");

	console.log("\nDone.");
	console.log(
		`  feed entries      : ${entries.length} (feed reports ${total})`,
	);
	console.log(`  posts scraped     : ${stories.length}`);
	console.log(`  posts failed      : ${failures.length}`);
	console.log(
		`  images downloaded : ${imageMap.size - cachedCount} (${cachedCount} already cached)`,
	);
	console.log(`  images failed     : ${imageFailures.length}`);
	console.log(
		`  output            : ${path.relative(process.cwd(), outputFile)}`,
	);

	for (const failure of failures) {
		console.error(`  ! post  ${failure.slug}: ${failure.reason}`);
	}
	for (const failure of imageFailures.slice(0, 20)) {
		console.error(`  ! image ${failure.url}: ${failure.reason}`);
	}
	if (imageFailures.length > 20) {
		console.error(`  … and ${imageFailures.length - 20} more image failures`);
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});

#!/usr/bin/env node
/**
 * Phase B — imports database/seeds/stories.json into the `story` collection.
 *
 * Boots Strapi in-process (same pattern as server.cjs) so it can use the upload
 * and document services directly. Idempotent: entries are upserted on
 * `blogspotId`, and already-uploaded media is reused instead of duplicated.
 *
 *   pnpm --filter=backend run import:stories
 */

const fs = require("node:fs");
const path = require("node:path");
const strapiFactory = require("@strapi/strapi");

const seedDir = path.resolve(__dirname, "..", "database", "seeds");
const storiesFile = path.join(seedDir, "stories.json");
const mediaDir = path.join(seedDir, "media");

const MIME_TYPES = {
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".png": "image/png",
	".gif": "image/gif",
	".webp": "image/webp",
	".avif": "image/avif",
	".svg": "image/svg+xml",
};

const DRY_RUN = process.argv.includes("--dry-run");

// Tearing down Strapi rejects any pending knex pool acquisition with
// "aborted". It surfaces as an unhandled rejection that would crash the
// process after the import has already succeeded.
process.on("unhandledRejection", (error) => {
	if (String(error && error.message) === "aborted") return;
	throw error;
});

/* ------------------------------------------------------------------- seo */

function truncateAtWord(text, max) {
	if (text.length <= max) return text;
	const cut = text.slice(0, max);
	const lastSpace = cut.lastIndexOf(" ");
	return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim();
}

/**
 * `shared.seo` is shared with `post` and `page`, so its constraints are not
 * ours to relax: metaTitle <= 60, metaDescription 50-160, both required.
 * Only emit the component when the source data can satisfy it.
 */
function buildSeo(story) {
	const metaTitle = truncateAtWord((story.title || "").trim(), 60);
	const source = (story.metaDescription || story.excerpt || "").trim();
	const metaDescription = truncateAtWord(source, 160);

	if (!metaTitle) return null;
	// Too short to satisfy the component's minLength — leave `seo` empty and
	// let `excerpt` carry the summary instead.
	if (metaDescription.length < 50) return null;

	const seo = { metaTitle, metaDescription };
	const keywords = (story.labels || []).join(",");
	if (keywords) seo.keywords = keywords;
	return seo;
}

function buildSeoFor(story, thumbnailId) {
	const seo = buildSeo(story);
	if (seo && thumbnailId) seo.metaImage = thumbnailId;
	return seo;
}

/* ----------------------------------------------------------------- upload */

/** Uploads one seed file, reusing an existing Media Library entry if present. */
async function uploadMedia(strapi, fileName, cache) {
	if (cache.has(fileName)) return cache.get(fileName);

	const baseName = path.basename(fileName, path.extname(fileName));

	const existing = await strapi.db.query("plugin::upload.file").findOne({
		where: { name: fileName },
	});
	if (existing) {
		cache.set(fileName, existing);
		return existing;
	}

	const filePath = path.join(mediaDir, fileName);
	if (!fs.existsSync(filePath)) return null;

	const extension = path.extname(fileName).toLowerCase();
	const [uploaded] = await strapi
		.plugin("upload")
		.service("upload")
		.upload({
			data: {
				fileInfo: { name: fileName, alternativeText: baseName, caption: "" },
			},
			files: {
				filepath: filePath,
				originalFilename: fileName,
				mimetype: MIME_TYPES[extension] || "image/jpeg",
				size: fs.statSync(filePath).size,
			},
		});

	cache.set(fileName, uploaded);
	return uploaded;
}

/* ------------------------------------------------------------------- html */

function rewriteImageUrls(html, replacements) {
	let output = html;
	for (const [originalUrl, newUrl] of replacements) {
		output = output.split(originalUrl).join(newUrl);
		// The scraper normalised protocol-relative URLs; the raw body may still
		// contain the `//host/...` form in srcset or data attributes.
		output = output.split(originalUrl.replace(/^https:/, "")).join(newUrl);
	}
	return pointLightboxLinksAtLocalFiles(output);
}

/**
 * Blogger wraps each image in an `<a>` pointing at the full-size original on
 * its CDN. Those hrefs are never image `src`s, so the pass above leaves them
 * behind. Repoint them at the file we just uploaded for the wrapped `<img>`.
 */
function pointLightboxLinksAtLocalFiles(html) {
	return html.replace(
		/<a\b([^>]*?)href=(["'])(https?:)?\/\/(?:blogger\.googleusercontent\.com|lh\d+\.googleusercontent\.com|\d+\.bp\.blogspot\.com)\/[^"']*\2([^>]*)>([\s\S]*?)<\/a\s*>/gi,
		(match, before, quote, _protocol, after, inner) => {
			const localSrc = /<img\b[^>]*\bsrc=["'](\/uploads\/[^"']+)["']/i.exec(
				inner,
			);
			if (!localSrc) return match;
			return `<a${before}href=${quote}${localSrc[1]}${quote}${after}>${inner}</a>`;
		},
	);
}

/* ------------------------------------------------------------------- main */

async function main() {
	if (!fs.existsSync(storiesFile)) {
		throw new Error(
			`${path.relative(process.cwd(), storiesFile)} not found — run \`pnpm --filter=backend run scrape:blogspot\` first.`,
		);
	}

	let stories = JSON.parse(fs.readFileSync(storiesFile, "utf8"));

	// `--limit N` is for smoke-testing the import before committing to all 219.
	const limitArg = process.argv.indexOf("--limit");
	if (limitArg !== -1 && process.argv[limitArg + 1]) {
		stories = stories.slice(0, Number(process.argv[limitArg + 1]));
	}

	console.log(`Loaded ${stories.length} stories from seed file.`);

	const app = await strapiFactory
		.createStrapi({ distDir: path.resolve(__dirname, "..", "dist") })
		.load();

	const mediaCache = new Map();
	const stats = {
		created: 0,
		updated: 0,
		failed: 0,
		uploaded: 0,
		seoSkipped: 0,
	};
	const failures = [];

	try {
		for (const [index, story] of stories.entries()) {
			try {
				const replacements = [];

				for (const image of story.images || []) {
					const uploaded = await uploadMedia(app, image.localFile, mediaCache);
					if (uploaded) replacements.push([image.originalUrl, uploaded.url]);
				}

				let thumbnail = null;
				if (story.thumbnailFile) {
					const uploaded = await uploadMedia(
						app,
						story.thumbnailFile,
						mediaCache,
					);
					if (uploaded) thumbnail = uploaded.id;
				}

				const seo = buildSeoFor(story, thumbnail);
				if (!seo) stats.seoSkipped += 1;

				const data = {
					title: story.title.slice(0, 255),
					slug: story.slug.slice(0, 255),
					excerpt: story.excerpt || null,
					content: rewriteImageUrls(story.content, replacements),
					contentText: story.contentText || null,
					thumbnail,
					labels: story.labels || [],
					blogspotId: story.blogspotId,
					blogspotUrl: story.blogspotUrl,
					blogspotPath: story.blogspotPath,
					publishedDate: story.publishedDate,
					updatedDate: story.updatedDate || null,
					commentCount: story.commentCount || 0,
					author: story.author || null,
					seo,
				};

				if (DRY_RUN) {
					stats.created += 1;
					continue;
				}

				const existing = await app.documents("api::story.story").findFirst({
					filters: { blogspotId: story.blogspotId },
					status: "published",
				});

				if (existing) {
					await app.documents("api::story.story").update({
						documentId: existing.documentId,
						data,
						status: "published",
					});
					stats.updated += 1;
				} else {
					await app.documents("api::story.story").create({
						data,
						status: "published",
					});
					stats.created += 1;
				}
			} catch (error) {
				stats.failed += 1;
				failures.push({
					slug: story.slug,
					reason: String(error.message || error),
				});
			}

			if ((index + 1) % 20 === 0) {
				console.log(`  ${index + 1}/${stories.length}`);
			}
		}

		stats.uploaded = mediaCache.size;

		console.log("\nDone.");
		console.log(`  created      : ${stats.created}`);
		console.log(`  updated      : ${stats.updated}`);
		console.log(`  failed       : ${stats.failed}`);
		console.log(`  media linked : ${stats.uploaded}`);
		console.log(
			`  seo skipped  : ${stats.seoSkipped} (description outside 50-160 chars)`,
		);

		for (const failure of failures) {
			console.error(`  ! ${failure.slug}: ${failure.reason}`);
		}
	} finally {
		// Strapi's knex pool rejects pending acquisitions with "aborted" on
		// shutdown; that is noise once the import itself has finished.
		await app.destroy().catch(() => {});
	}

	process.exit(failures.length > 0 ? 1 : 0);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});

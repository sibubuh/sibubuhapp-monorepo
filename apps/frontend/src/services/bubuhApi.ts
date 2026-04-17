import type { BubuhBlogFeed, BubuhBlogPost } from "../types/bubuh";

const BUBUH_API_BASE = "https://www.bubuh.id/feeds/posts/default";
const RSS2JSON_BASE = "https://api.rss2json.com/v1/api.json";
const RSS2JSON_API_KEY = import.meta.env.VITE_RSS2JSON_API_KEY;

const bubuhCache = {
	data: null as BubuhBlogFeed | null,
	timestamp: 0,
	TTL: 5 * 60 * 1000, // 5 minutes
};

async function fetchFromRSS2JSON(limit: number): Promise<BubuhBlogFeed> {
	const url = `${RSS2JSON_BASE}?rss_url=${encodeURIComponent(BUBUH_API_BASE)}&api_key=${RSS2JSON_API_KEY}&count=${limit}&field=content`;

	console.log(`[BubuhAPI] Fetching from: ${RSS2JSON_BASE}`);

	try {
		const response = await fetch(url);
		const data = await response.json();

		if (data.status !== "ok") {
			console.error("[BubuhAPI] RSS2JSON error:", data.message);
			return {
				posts: [],
				totalResults: 0,
				startIndex: 0,
				itemsPerPage: 0,
			};
		}

		return parseRSS2JSONResponse(data);
	} catch (error) {
		console.error("[BubuhAPI] Error fetching bubuh blogs:", error);
		return {
			posts: [],
			totalResults: 0,
			startIndex: 0,
			itemsPerPage: 0,
		};
	}
}

function refreshCache(limit: number): void {
	fetchFromRSS2JSON(limit)
		.then((result) => {
			bubuhCache.data = result;
			bubuhCache.timestamp = Date.now();
		})
		.catch(console.error);
}

export async function getRecentBubuhBlogs(
	limit: number = 6,
): Promise<BubuhBlogFeed> {
	const now = Date.now();
	const isCacheValid =
		bubuhCache.data && now - bubuhCache.timestamp < bubuhCache.TTL;
	const isCacheStale =
		bubuhCache.data && now - bubuhCache.timestamp >= bubuhCache.TTL;

	if (isCacheValid) {
		refreshCache(limit);
		return bubuhCache.data;
	}

	if (isCacheStale) {
		refreshCache(limit);
		return bubuhCache.data;
	}

	const result = await fetchFromRSS2JSON(limit);
	bubuhCache.data = result;
	bubuhCache.timestamp = Date.now();
	return result;
}

function parseRSS2JSONResponse(data: {
	status: string;
	feed: {
		title: string;
	};
	items: Array<{
		title: string;
		link: string;
		pubDate: string;
		thumbnail: string;
		categories: string[];
		description: string;
		content: string;
		author: string;
	}>;
}): BubuhBlogFeed {
	const getHighResImage = (url: string | undefined): string | undefined => {
		if (!url) return undefined;
		// Replace Blogger thumbnail size codes (s72-w640-h640-c) with s1600 for higher res
		return url.replace(/\/s\d+(-\w+)*\//, "/s1600/");
	};

	const extractImageFromContent = (htmlContent: string): string | undefined => {
		if (!htmlContent) return undefined;
		const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
		return imgMatch ? imgMatch[1] : undefined;
	};

	const posts: BubuhBlogPost[] = (data.items || []).map((item, index) => {
		const summary = item.description
			? item.description.replace(/<[^>]*>/g, "").trim()
			: "";

		const thumbnailUrl =
			extractImageFromContent(item.content) ||
			extractImageFromContent(item.description) ||
			item.thumbnail ||
			undefined;

		return {
			id: String(index + 1),
			title: item.title || "Untitled",
			link: item.link || "#",
			published: item.pubDate || "",
			updated: item.pubDate,
			categories: item.categories || [],
			summary:
				summary.length > 150 ? summary.substring(0, 150) + "..." : summary,
			thumbnail: thumbnailUrl
				? {
						url: getHighResImage(thumbnailUrl),
						width: 1600,
						height: 1000,
					}
				: undefined,
			author: item.author,
			commentCount: 0,
			location: undefined,
		};
	});

	return {
		posts,
		totalResults: posts.length,
		startIndex: 1,
		itemsPerPage: posts.length,
	};
}

export function formatBlogDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString("id-ID", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

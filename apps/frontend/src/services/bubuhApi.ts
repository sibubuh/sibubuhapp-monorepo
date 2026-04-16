import type { BubuhBlogFeed, BubuhBlogPost } from "../types/bubuh";

const BUBUH_API_BASE = "https://www.bubuh.id/feeds/posts/default";

const CORS_PROXIES = [
	"https://corsproxy.io/?",
	"https://api.allorigins.win/raw?url=",
	"https://api.codetabs.com/v1/proxy?quest=",
];

async function fetchWithProxy(url: string): Promise<Response> {
	for (const proxy of CORS_PROXIES) {
		try {
			const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
			console.log(`[BubuhAPI] Trying proxy: ${proxy}`);

			const response = await fetch(proxyUrl, {
				method: "GET",
				headers: {
					Accept: "application/json",
				},
			});

			if (response.ok) {
				console.log(`[BubuhAPI] Success with proxy: ${proxy}`);
				return response;
			}

			console.warn(
				`[BubuhAPI] Proxy ${proxy} returned status: ${response.status}`,
			);
		} catch (error) {
			console.warn(`[BubuhAPI] Proxy ${proxy} failed:`, error);
		}
	}

	throw new Error("All CORS proxies failed");
}

export async function getRecentBubuhBlogs(
	limit: number = 6,
): Promise<BubuhBlogFeed> {
	const apiUrl = `${BUBUH_API_BASE}?alt=json&orderby=published&max-results=${limit}`;

	console.log(`[BubuhAPI] Fetching from: ${apiUrl}`);

	try {
		const response = await fetchWithProxy(apiUrl);
		const text = await response.text();

		console.log(`[BubuhAPI] Response length: ${text.length} chars`);

		const data = JSON.parse(text);
		return parseBloggerJsonFeed(data);
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

function parseBloggerJsonFeed(data: {
	feed?: {
		entry?: Array<{
			id?: { $t?: string };
			title?: { $t?: string };
			link?: Array<{
				rel?: string;
				href?: string;
				type?: string;
			}>;
			published?: { $t?: string };
			updated?: { $t?: string };
			category?: Array<{ term?: string }>;
			summary?: { $t?: string };
			media$thumbnail?: {
				url?: string;
				width?: string;
				height?: string;
			};
			author?: Array<{ name?: { $t?: string } }>;
			thr$total?: { $t?: string };
			georss$point?: {
				$t?: string;
			};
			georss$featurename?: { $t?: string };
		}>;
		totalResults?: { $t?: string };
		startIndex?: { $t?: string };
		itemsPerPage?: { $t?: string };
	};
}): BubuhBlogFeed {
	const feed = data.feed;

	if (!feed) {
		return {
			posts: [],
			totalResults: 0,
			startIndex: 0,
			itemsPerPage: 0,
		};
	}

	const posts: BubuhBlogPost[] = (feed.entry || []).map((entry) => {
		const link = entry.link?.find((l) => l.rel === "alternate")?.href || "#";
		const id = entry.id?.$t?.split("post-")?.[1] || "";
		const summary = entry.summary?.$t?.replace(/<[^>]*>/g, "").trim() || "";
		const thumbnailUrl = entry.media$thumbnail?.url || "";
		const thumbnailOriginal = thumbnailUrl.replace(/\/s\d+(-\w+)*\//, "/s640/");

		let location: BubuhBlogPost["location"] = undefined;
		if (entry.georss$point?.$t) {
			const [lat, lng] = entry.georss$point.$t.split(" ");
			location = {
				name: entry.georss$featurename?.$t || "",
				lat: parseFloat(lat),
				lng: parseFloat(lng),
			};
		}

		return {
			id,
			title: entry.title?.$t || "Untitled",
			link,
			published: entry.published?.$t || "",
			updated: entry.updated?.$t,
			categories: (entry.category || [])
				.map((c) => c.term || "")
				.filter(Boolean),
			summary:
				summary.length > 150 ? summary.substring(0, 150) + "..." : summary,
			thumbnail: thumbnailUrl
				? {
						url: thumbnailOriginal || thumbnailUrl,
						width: parseInt(entry.media$thumbnail?.width || "72"),
						height: parseInt(entry.media$thumbnail?.height || "72"),
					}
				: undefined,
			author: entry.author?.[0]?.name?.$t,
			commentCount: entry.thr$total ? parseInt(entry.thr$total?.$t || "0") : 0,
			location,
		};
	});

	return {
		posts,
		totalResults: parseInt(feed.totalResults?.$t || "0"),
		startIndex: parseInt(feed.startIndex?.$t || "1"),
		itemsPerPage: parseInt(feed.itemsPerPage?.$t || String(posts.length)),
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

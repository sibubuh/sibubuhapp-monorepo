import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "../../config/metadata";
import { storyPath } from "../../libs/story";
import { getPageSlugs, getProjects, getStories } from "../../services/api";

type SitemapEntry = {
	path: string;
	lastmod?: string;
	changefreq?: string;
	priority?: string;
};

/** XML has five reserved characters; a slug or title could carry any of them. */
function escapeXml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function toUrlNode(entry: SitemapEntry): string {
	const parts = [`    <loc>${escapeXml(`${SITE_URL}${entry.path}`)}</loc>`];

	if (entry.lastmod) {
		const date = new Date(entry.lastmod);
		if (!Number.isNaN(date.getTime())) {
			parts.push(`    <lastmod>${date.toISOString().slice(0, 10)}</lastmod>`);
		}
	}
	if (entry.changefreq)
		parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
	if (entry.priority)
		parts.push(`    <priority>${entry.priority}</priority>`);

	return `  <url>\n${parts.join("\n")}\n  </url>`;
}

/**
 * Served at /sitemap.xml — the `[.]` in the filename escapes the dot so
 * TanStack treats it as a literal character instead of a path separator.
 *
 * Built at request time from the CMS so new projects and pages appear without
 * a redeploy. Content-Type matters: crawlers reject a sitemap served as HTML.
 */
export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: async () => {
				const [projectsResult, pageSlugs, storiesResult] = await Promise.all([
					getProjects({ locale: null, limit: 200 }).catch(() => ({
						data: [],
						total: 0,
					})),
					getPageSlugs().catch(() => []),
					getStories({ limit: 500, page: 1 }).catch(() => null),
				]);

				const entries: SitemapEntry[] = [
					{ path: "/", changefreq: "weekly", priority: "1.0" },
					{ path: "/projects", changefreq: "weekly", priority: "0.9" },
					{ path: "/stories", changefreq: "weekly", priority: "0.9" },
					...pageSlugs.map((page) => ({
						path: `/${page.slug}`,
						lastmod: page.updatedAt,
						changefreq: "monthly",
						priority: "0.7",
					})),
					...(projectsResult?.data ?? []).map((project) => ({
						path: `/projects/${project.slug}`,
						lastmod: project.updatedAt || project.createdAt,
						changefreq: "monthly",
						priority: "0.8",
					})),
					...(storiesResult?.data ?? []).map((story) => ({
						path: storyPath(story),
						lastmod: story.updatedDate || story.publishedDate,
						changefreq: "monthly",
						priority: "0.7",
					})),
				];

				const xml = [
					'<?xml version="1.0" encoding="UTF-8"?>',
					'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
					...entries.map(toUrlNode),
					"</urlset>",
				].join("\n");

				return new Response(xml, {
					headers: {
						"Content-Type": "application/xml; charset=utf-8",
						"Cache-Control": "public, max-age=3600",
					},
				});
			},
		},
	},
});

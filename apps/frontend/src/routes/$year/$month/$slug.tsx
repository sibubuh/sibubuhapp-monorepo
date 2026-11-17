import { createFileRoute } from "@tanstack/react-router";
import { blogspotPathFromParams } from "../../../../libs/story";
import { getStoryByPath } from "../../../../services/api";

/**
 * Legacy bubuh.id URLs — `/2025/12/my-post.html`.
 *
 * Every link shared over the blog's lifetime points here, so the path stays
 * alive as a permanent redirect to the canonical `/stories/<slug>` instead of
 * rendering a second copy of the article. Two URLs serving identical content
 * splits ranking signals; a 301 merges them.
 *
 * The target slug is looked up rather than derived: two Blogger posts shared
 * the slug `pengembangan-kapasitas-komunitas-dalam`, so the later one is
 * stored under a different slug and only `blogspotPath` tells them apart.
 *
 * The filename is a plain `$slug`, not `$slug[.]html`: TanStack's `[.]` escape
 * would fold the extension into the param name (`slug.html`), which is not a
 * valid identifier. A dynamic segment already matches the dot.
 */
export const Route = createFileRoute("/$year/$month/$slug")({
	server: {
		handlers: {
			GET: async ({ params }: { params: Record<string, string> }) => {
				const { year, month, slug } = params;

				if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month)) {
					return new Response("Not Found", { status: 404 });
				}
				if (!slug.endsWith(".html")) {
					return new Response("Not Found", { status: 404 });
				}

				const bareSlug = slug.replace(/\.html$/, "");

				let story = null;
				try {
					story = await getStoryByPath({
						path: blogspotPathFromParams({ year, month, slug }),
						slug: bareSlug,
					});
				} catch (error) {
					console.error("Error resolving legacy story URL:", error);
				}

				if (!story) {
					return new Response("Not Found", { status: 404 });
				}

				return new Response(null, {
					status: 301,
					headers: {
						Location: `/stories/${story.slug}`,
						"Cache-Control": "public, max-age=3600",
					},
				});
			},
		},
	},
});

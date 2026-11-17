import type { Story } from "../types/story";

/**
 * Canonical URL for a story on this site.
 *
 * Blogger's own `/YYYY/MM/slug.html` shape is kept alive as a 301 redirect
 * (see routes/$year/$month/$slug.tsx) rather than as the canonical form, so
 * every inbound link that has been shared for years still resolves while
 * search engines consolidate on one URL.
 */
export function storyPath(story: Pick<Story, "slug">): string {
	return `/stories/${story.slug}`;
}

/** The original bubuh.id path, used only to recognise legacy inbound links. */
export function legacyBlogspotPath(
	story: Pick<Story, "slug" | "blogspotPath" | "publishedDate">,
): string {
	if (story.blogspotPath) return story.blogspotPath;

	const date = new Date(story.publishedDate);
	if (Number.isNaN(date.getTime())) return `/${story.slug}.html`;

	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, "0");
	return `/${year}/${month}/${story.slug}.html`;
}

/** Rebuilds the Blogger path from the legacy route's params. */
export function blogspotPathFromParams(params: {
	year: string;
	month: string;
	slug: string;
}): string {
	const slug = params.slug.replace(/\.html$/, "");
	return `/${params.year}/${params.month}/${slug}.html`;
}

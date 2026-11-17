import {
	DEFAULT_OG_IMAGE,
	SITE_AUTHOR,
	SITE_DESCRIPTION,
	SITE_NAME,
	SITE_URL,
} from "../../../config/metadata";
import { STRAPI_CMS_BASE_URL } from "../../../config/strapi";

export interface SeoHeadInput {
	/** Page title without the site-name suffix. */
	title?: string;
	description?: string;
	keywords?: string;
	/** Absolute URL, or a Strapi upload path such as "/uploads/cover.jpg". */
	image?: string;
	/** Route path driving canonical and og:url, e.g. "/projects/my-work". */
	path: string;
	type?: "website" | "article" | "profile";
	/** ISO date strings; feed Google's G-DATES check. */
	publishedTime?: string;
	modifiedTime?: string;
	author?: string;
	noIndex?: boolean;
}

/** Canonical form: absolute, no trailing slash except on the root. */
export function absoluteUrl(path: string): string {
	if (/^https?:\/\//i.test(path)) return path;
	const normalized = `/${path}`.replace(/\/+/g, "/").replace(/\/+$/, "");
	return `${SITE_URL}${normalized || "/"}`;
}

/** Strapi serves uploads relative to its own origin, not ours. */
function resolveImage(image?: string): string {
	const candidate = image || DEFAULT_OG_IMAGE;
	if (!candidate) return "";
	if (/^https?:\/\//i.test(candidate)) return candidate;
	if (candidate.startsWith("/uploads"))
		return `${STRAPI_CMS_BASE_URL ?? ""}${candidate}`;
	return absoluteUrl(candidate);
}

/**
 * Builds the `head` payload for a TanStack Router route.
 *
 * These tags must come from the route's `head()` option rather than from a
 * component: TanStack renders them through <HeadContent /> inside <head>, and
 * Google only honours rel=canonical when it appears there.
 */
export function buildSeoHead(input: SeoHeadInput) {
	const {
		title,
		description = SITE_DESCRIPTION,
		keywords,
		image,
		path,
		type = "website",
		publishedTime,
		modifiedTime,
		author = SITE_AUTHOR,
		noIndex = false,
	} = input;

	const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
	const canonical = absoluteUrl(path);
	const ogImage = resolveImage(image);

	const meta: Array<Record<string, string>> = [
		{ title: fullTitle },
		{ name: "description", content: description },
		{ name: "author", content: author },
		{ property: "og:title", content: fullTitle },
		{ property: "og:description", content: description },
		{ property: "og:type", content: type },
		{ property: "og:url", content: canonical },
		{ property: "og:site_name", content: SITE_NAME },
		{ property: "og:locale", content: "en_US" },
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:title", content: fullTitle },
		{ name: "twitter:description", content: description },
	];

	if (keywords) meta.push({ name: "keywords", content: keywords });
	if (ogImage) {
		meta.push({ property: "og:image", content: ogImage });
		meta.push({ name: "twitter:image", content: ogImage });
	}
	if (publishedTime)
		meta.push({ property: "article:published_time", content: publishedTime });
	if (modifiedTime)
		meta.push({ property: "article:modified_time", content: modifiedTime });
	if (noIndex) meta.push({ name: "robots", content: "noindex, nofollow" });

	return {
		meta,
		links: [{ rel: "canonical", href: canonical }],
	};
}

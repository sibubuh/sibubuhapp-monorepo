import { STRAPI_CMS_BASE_URL } from "../config/strapi";
import type { ImageType } from "../types/image";

/**
 * Strapi already generates thumbnail/small/medium/large variants on upload, but
 * the site only ever requested the original file — a 2896x1506 PNG cover ships
 * 1.4MB into a card that renders at ~600px. These helpers turn the `formats`
 * object Strapi hands back into a plain srcset so the browser picks a variant
 * that matches the slot.
 */

/** CMS uploads are stored as origin-relative paths; anything else is absolute. */
export function resolveStrapiUrl(url: string): string {
	return /^(https?:)?\/\//.test(url) ? url : `${STRAPI_CMS_BASE_URL}${url}`;
}

export interface ResponsiveImage {
	src: string;
	srcSet?: string;
	/** Intrinsic dimensions of the original, so the ratio is right for any variant. */
	width?: number;
	height?: number;
}

/**
 * Builds `src` + `srcSet` for a Strapi image.
 *
 * `src` prefers the `large` variant (1000px wide, the biggest Strapi makes) so
 * even browsers that ignore srcset stop downloading multi-megabyte originals.
 * The original stays in the srcset for displays that genuinely need it.
 *
 * Returns null for a missing image so callers can skip rendering the <img>.
 */
export function strapiImage(
	image: ImageType | null | undefined,
): ResponsiveImage | null {
	if (!image?.url) return null;

	const formats = image.formats ?? {};
	const candidates = [
		...Object.values(formats).filter((f) => f?.url && f.width > 0),
		{ url: image.url, width: image.width },
	];

	// Strapi omits formats larger than the source, so the same width can appear
	// twice (e.g. a 500px upload has `small` identical to the original).
	const byWidth = new Map<number, string>();
	for (const candidate of candidates) {
		if (candidate.width > 0) byWidth.set(candidate.width, candidate.url);
	}

	const sorted = [...byWidth.entries()].sort((a, b) => a[0] - b[0]);
	const fallback = formats.large?.url ?? image.url;

	return {
		src: resolveStrapiUrl(fallback),
		srcSet:
			sorted.length > 1
				? sorted
						.map(([width, url]) => `${resolveStrapiUrl(url)} ${width}w`)
						.join(", ")
				: undefined,
		width: image.width || undefined,
		height: image.height || undefined,
	};
}

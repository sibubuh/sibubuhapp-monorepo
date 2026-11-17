import DOMPurify from "isomorphic-dompurify";

/**
 * Stories are raw HTML imported from Blogger, so they go through DOMPurify
 * before they are ever handed to dangerouslySetInnerHTML (plan.md Phase 1.3).
 *
 * `isomorphic-dompurify` is used rather than plain `dompurify` because these
 * routes are server-rendered — plain DOMPurify needs a real `window`.
 */
export function sanitizeHtml(html: string): string {
	if (!html) return "";

	return DOMPurify.sanitize(html, {
		// Blogger bodies legitimately contain YouTube/Maps embeds and the data-*
		// attributes its editor writes for original image dimensions.
		ADD_TAGS: ["iframe"],
		ADD_ATTR: [
			"allow",
			"allowfullscreen",
			"frameborder",
			"scrolling",
			"target",
			"loading",
		],
		FORBID_TAGS: ["style", "script", "form", "input", "button"],
		FORBID_ATTR: ["onerror", "onload", "onclick"],
	});
}

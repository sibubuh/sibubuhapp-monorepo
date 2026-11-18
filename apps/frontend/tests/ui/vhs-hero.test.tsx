import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CssVhs, VHSHero } from "../../src/components/ui/VHSHero";

/**
 * The WebGL effect is lazy-loaded, so the first thing anyone sees — server
 * markup, and the client until the chunk lands — must be the CSS fallback.
 * A regression here shows up as an empty hero, not as an error.
 */
describe("VHSHero", () => {
	it("server-renders the CSS fallback, not the canvas", () => {
		const html = renderToStaticMarkup(
			<VHSHero className="h-96">
				<p>hero content</p>
			</VHSHero>,
		);

		expect(html).toContain("vhs-fx-scanlines");
		expect(html).toContain("hero content");
		expect(html).not.toContain("<canvas");
	});

	it("keeps the caller's sizing class on the wrapper", () => {
		const html = renderToStaticMarkup(
			<CssVhs className="h-96">
				<p>hero content</p>
			</CssVhs>,
		);

		expect(html).toMatch(/class="vhs-fx h-96"/);
	});
});

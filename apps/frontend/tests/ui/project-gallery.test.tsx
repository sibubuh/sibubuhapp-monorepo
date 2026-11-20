import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ProjectGallery, { wrapIndex } from "../../src/components/projects/ProjectGallery";
import type { ImageType } from "../../types/image";

const images: ImageType[] = [
	{
		id: 1,
		url: "/uploads/one.jpg",
		width: 2000,
		height: 1200,
		name: "one.jpg",
		size: 900,
		alt: "Panggung utama",
		formats: {
			thumbnail: { url: "/uploads/thumbnail_one.jpg", width: 245, height: 147 },
			large: { url: "/uploads/large_one.jpg", width: 1000, height: 600 },
		},
	},
	{
		id: 2,
		url: "/uploads/two.jpg",
		width: 1500,
		height: 1500,
		name: "two.jpg",
		size: 700,
	},
];

describe("wrapIndex", () => {
	it("wraps past the end back to the start", () => {
		expect(wrapIndex(3, 3)).toBe(0);
		expect(wrapIndex(4, 3)).toBe(1);
	});

	it("wraps before the start back to the end", () => {
		expect(wrapIndex(-1, 3)).toBe(2);
		expect(wrapIndex(-4, 3)).toBe(2);
	});

	it("stays put for a single image and survives an empty list", () => {
		expect(wrapIndex(1, 1)).toBe(0);
		expect(wrapIndex(-1, 1)).toBe(0);
		expect(wrapIndex(0, 0)).toBe(0);
	});
});

describe("ProjectGallery", () => {
	it("renders nothing without images", () => {
		expect(renderToStaticMarkup(<ProjectGallery images={[]} title="Acara" />)).toBe("");
	});

	/**
	 * The old carousel shipped the raw Strapi original. Thumbnails must stay on
	 * the resized variants, otherwise a gallery of 20 photos costs tens of MB.
	 */
	it("serves resized variants through srcset", () => {
		const html = renderToStaticMarkup(<ProjectGallery images={images} title="Acara" />);

		expect(html).toContain("large_one.jpg 1000w");
		expect(html).toContain("one.jpg 2000w");
		expect(html).toContain('loading="lazy"');
	});

	it("falls back to the project title when the upload has no alt text", () => {
		const html = renderToStaticMarkup(<ProjectGallery images={images} title="Acara" />);

		expect(html).toContain('alt="Panggung utama"');
		expect(html).toContain('alt="Acara"');
	});

	it("keeps the lightbox closed until a thumbnail is clicked", () => {
		const html = renderToStaticMarkup(<ProjectGallery images={images} title="Acara" />);

		expect(html).not.toContain('role="dialog"');
	});
});

import { describe, expect, it } from "vitest";
import { strapiImage } from "../../libs/strapi-image";
import type { ImageType } from "../../types/image";

const withFormats: ImageType = {
	id: 1,
	name: "cover.png",
	url: "/uploads/cover.png",
	size: 1447,
	width: 2896,
	height: 1506,
	formats: {
		thumbnail: { url: "/uploads/thumbnail_cover.png", width: 245, height: 127 },
		small: { url: "/uploads/small_cover.png", width: 500, height: 260 },
		medium: { url: "/uploads/medium_cover.png", width: 750, height: 390 },
		large: { url: "/uploads/large_cover.png", width: 1000, height: 520 },
	},
};

describe("strapiImage", () => {
	it("falls back to the large variant rather than the original", () => {
		expect(strapiImage(withFormats)?.src).toContain("large_cover.png");
	});

	it("offers every variant plus the original, ascending by width", () => {
		const widths = strapiImage(withFormats)
			?.srcSet?.split(", ")
			.map((entry) => entry.split(" ")[1]);

		expect(widths).toEqual(["245w", "500w", "750w", "1000w", "2896w"]);
	});

	it("reports the original intrinsic size so the aspect ratio stays right", () => {
		expect(strapiImage(withFormats)).toMatchObject({
			width: 2896,
			height: 1506,
		});
	});

	it("drops the srcSet when Strapi generated no smaller variant", () => {
		const tiny: ImageType = {
			id: 2,
			name: "logo.png",
			url: "/uploads/logo.png",
			size: 3,
			width: 225,
			height: 225,
		};

		expect(strapiImage(tiny)).toMatchObject({
			srcSet: undefined,
		});
		expect(strapiImage(tiny)?.src).toContain("/uploads/logo.png");
	});

	it("collapses variants that share a width with the original", () => {
		const duplicated: ImageType = {
			id: 3,
			name: "square.png",
			url: "/uploads/square.png",
			size: 40,
			width: 500,
			height: 500,
			formats: {
				small: { url: "/uploads/small_square.png", width: 500, height: 500 },
			},
		};

		expect(strapiImage(duplicated)?.srcSet).toBeUndefined();
	});

	it("returns null when there is no image", () => {
		expect(strapiImage(null)).toBeNull();
		expect(strapiImage(undefined)).toBeNull();
	});

	it("leaves absolute URLs alone", () => {
		const external: ImageType = {
			id: 4,
			name: "remote.jpg",
			url: "https://images.example.test/remote.jpg",
			size: 10,
			width: 800,
			height: 600,
		};

		expect(strapiImage(external)?.src).toBe(
			"https://images.example.test/remote.jpg",
		);
	});
});

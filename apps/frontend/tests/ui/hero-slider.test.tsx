import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HeroSlider from "../../ui/HeroSlider";

const slides = [
	{
		id: 1,
		title: "First slide",
		sub: "The LCP element lives here.",
		img: "https://cms.example.test/uploads/hero.jpg",
		width: 1920,
		height: 1278,
	},
	{
		id: 2,
		title: "Second slide",
		sub: "Only this one may fade in.",
		img: "https://cms.example.test/uploads/hero-2.jpg",
		width: 1920,
		height: 1278,
	},
];

/**
 * The hero image is the page's LCP element. framer-motion applies `initial`
 * during SSR, so without <AnimatePresence initial={false}> the markup ships
 * with opacity:0 and the image stays invisible until hydration finishes —
 * 2.6s of pure render delay in the field. Guard the server markup, not the
 * hydrated DOM: by the time React has run, the bug has already cost the LCP.
 */
describe("HeroSlider server markup", () => {
	const html = renderToStaticMarkup(<HeroSlider slides={slides} />);
	const heroImg = html.match(/<img[^>]*hero\.jpg[^>]*>/)?.[0] ?? "";

	it("renders the first slide image", () => {
		expect(heroImg).not.toBe("");
	});

	it("paints the first slide without waiting for hydration", () => {
		expect(heroImg).not.toMatch(/opacity:\s*0/);
	});

	it("marks the hero image as high priority with intrinsic dimensions", () => {
		expect(heroImg).toMatch(/fetchpriority="high"/i);
		expect(heroImg).toMatch(/width="1920"/);
		expect(heroImg).toMatch(/height="1278"/);
	});
});

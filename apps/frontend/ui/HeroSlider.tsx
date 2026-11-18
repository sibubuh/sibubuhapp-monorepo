import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { CssVhs } from "../src/components/ui/VHSHero";
import { resolveStrapiUrl } from "../libs/strapi-image";

interface HeroSlide {
	id: number;
	title: string;
	sub: string;
	img: string;
	srcSet?: string;
	width?: number;
	height?: number;
}

/**
 * The hero panel is half the grid from lg, full width below it. Exported so the
 * route's preload hint can declare the same sizes — a mismatch makes the
 * browser pick a different variant and download the image twice.
 */
export const HERO_SIZES = "(min-width: 1024px) 50vw, 100vw";

interface HeroSliderProps {
	slides?: HeroSlide[];
}

const defaultSlides: HeroSlide[] = [
	{
		id: 1,
		title: "Sibubuh Agency",
		sub: "Architects of the modern web.",
		img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1920",
	},
	{
		id: 2,
		title: "Pure Design",
		sub: "Where logic meets visual art.",
		img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1920",
	},
];

/**
 * React 18 does not know `fetchPriority` and warns when it sees the camelCase
 * spelling, so pass the attribute through lowercase. Drop this once the app
 * moves to React 19, which supports the prop directly.
 */
const FETCH_PRIORITY_HIGH = { fetchpriority: "high" } as Record<string, string>;


export default function HeroSlider({ slides }: HeroSliderProps) {
	const [idx, setIdx] = useState(0);
	const activeSlides = slides && slides.length > 0 ? slides : defaultSlides;
	const reduceMotion = useReducedMotion();
	const fade = reduceMotion ? 0 : 0.7;

	useEffect(() => {
		const timer = setInterval(
			() => setIdx((i) => (i + 1) % activeSlides.length),
			7000,
		);
		return () => clearInterval(timer);
	}, [activeSlides.length]);

	const active = activeSlides[idx];

	return (
		<section className="relative bg-background text-foreground">
			<div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pt-28 pb-16 md:pt-36 md:pb-24 lg:grid-cols-12 lg:gap-16 lg:pt-40 lg:pb-32">
				{/* Copy column */}
				<div className="lg:col-span-6">
					<div className="flex items-center gap-4 font-sans text-xs text-muted-foreground">
						<span className="tabular-nums">
							{String(idx + 1).padStart(2, "0")}
						</span>
						<span className="h-px w-10 bg-border" />
						<span className="tabular-nums">
							{String(activeSlides.length).padStart(2, "0")}
						</span>
					</div>

					<AnimatePresence mode="wait">
						<motion.div
							key={active.id}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: fade }}
						>
							<h1 className="mt-6 font-serif text-4xl font-medium leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-6xl">
								{active.title}
							</h1>
							<p className="mt-6 max-w-md font-sans text-lg leading-relaxed text-muted-foreground">
								{active.sub}
							</p>
						</motion.div>
					</AnimatePresence>

					{activeSlides.length > 1 && (
						<div className="mt-10 flex items-center gap-3">
							{activeSlides.map((slide, i) => (
								<button
									key={slide.id}
									type="button"
									onClick={() => setIdx(i)}
									aria-label={slide.title}
									aria-current={i === idx}
									className="group flex h-8 items-center"
								>
									<span
										className={`block h-px transition-all duration-500 ${
											i === idx
												? "w-12 bg-foreground"
												: "w-6 bg-border group-hover:bg-muted-foreground"
										}`}
									/>
								</button>
							))}
						</div>
					)}
				</div>

				{/* Image panel — hanya panel gambar yang kena efek VHS supaya kolom
				    teks dan tombol navigasi slider tetap DOM murni & interaktif.
				    Versi CSS, bukan <VHSHero>: shader WebGL-nya ada di critical
				    path homepage dan menyumbang mayoritas TBT, sementara efek yang
				    terlihat nyaris sama. */}
				<div className="lg:col-span-6">
					<CssVhs className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted shadow-card sm:aspect-[16/10] lg:aspect-[4/5]">
						<div className="relative h-full w-full">
							{/* initial={false} skips the enter animation on the very first
							    mount. Without it the LCP image is server-rendered with
							    opacity:0 and only becomes visible after hydration, which
							    cost 2.6s of LCP render delay. Slide transitions after that
							    still fade. */}
							<AnimatePresence initial={false}>
								<motion.img
									key={active.id}
									src={resolveStrapiUrl(active.img)}
									srcSet={active.srcSet}
									sizes={HERO_SIZES}
									alt=""
									width={active.width}
									height={active.height}
									{...FETCH_PRIORITY_HIGH}
									decoding="async"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: fade }}
									className="absolute inset-0 h-full w-full object-cover"
								/>
							</AnimatePresence>
						</div>
					</CssVhs>
				</div>
			</div>
		</section>
	);
}

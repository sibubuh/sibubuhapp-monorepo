import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;

interface HeroSliderProps {
	slides?: Array<{
		id: number;
		title: string;
		sub: string;
		img: string;
	}>;
}

const defaultSlides = [
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

/** CMS images are relative paths; the fallback slides are absolute URLs. */
const resolveSrc = (img: string) =>
	/^(https?:)?\/\//.test(img) ? img : `${BASE_URL}${img}`;

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

				{/* Image panel */}
				<div className="lg:col-span-6">
					<div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted shadow-card sm:aspect-[16/10] lg:aspect-[4/5]">
						<AnimatePresence>
							<motion.img
								key={active.id}
								src={resolveSrc(active.img)}
								alt=""
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: fade }}
								className="absolute inset-0 h-full w-full object-cover"
							/>
						</AnimatePresence>
					</div>
				</div>
			</div>
		</section>
	);
}

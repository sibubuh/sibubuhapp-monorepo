import { motion } from "motion/react";
import type { HeroSection } from "../../types/sections/hero";
import { Eyebrow } from "../ui/Eyebrow";

export default function HeroSectionComponent({
	title,
	subtitle,
	eyebrow,
	image,
}: HeroSection) {
	return (
		<section className="relative h-[60vh] overflow-hidden bg-ink md:h-[80vh]">
			<img
				src={image.url}
				className="absolute inset-0 h-full w-full object-cover opacity-50"
				alt=""
			/>
			<div className="absolute inset-0 flex items-center justify-center">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="max-w-4xl px-6 text-center text-white"
				>
					{eyebrow && (
						<div className="mb-4">
							<Eyebrow>{eyebrow}</Eyebrow>
						</div>
					)}
					<h1 className="font-serif text-4xl font-medium text-balance text-white md:text-6xl">
						{title}
					</h1>
					{subtitle && (
						<p className="mt-6 text-lg text-white/80">{subtitle}</p>
					)}
				</motion.div>
			</div>
		</section>
	);
}

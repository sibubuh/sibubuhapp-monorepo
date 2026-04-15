import { motion } from "motion/react";
import type { HeroSection } from "../../types/sections/hero";

export default function HeroSectionComponent({
	title,
	subtitle,
	eyebrow,
	image,
}: HeroSection) {
	return (
		<section className="relative h-[60vh] md:h-[80vh] bg-neutral-950 overflow-hidden">
			<img
				src={image.url}
				className="absolute inset-0 w-full h-full object-cover opacity-50"
				alt=""
			/>
			<div className="absolute inset-0 flex items-center justify-center">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="text-center text-white max-w-4xl px-6"
				>
					{eyebrow && (
						<p className="text-sm uppercase tracking-[0.3em] mb-4 text-neutral-300">
							{eyebrow}
						</p>
					)}
					<h1 className="text-5xl md:text-7xl font-black tracking-tight">
						{title}
					</h1>
					{subtitle && (
						<p className="mt-6 text-xl text-neutral-300">{subtitle}</p>
					)}
				</motion.div>
			</div>
		</section>
	);
}

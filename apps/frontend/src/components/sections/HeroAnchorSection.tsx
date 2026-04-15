import { motion } from "motion/react";
import type { HeroAnchorSection } from "../../types/sections/hero-anchor";

export default function HeroAnchorSectionComponent({
	title,
	action_text,
	slug,
	image,
}: HeroAnchorSection) {
	return (
		<section className="relative h-[60vh] md:h-[70vh] bg-neutral-950 overflow-hidden">
			<img
				src={image.url}
				className="absolute inset-0 w-full h-full object-cover opacity-50"
				alt=""
			/>
			<div className="absolute inset-0 flex items-center justify-center">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="text-center text-white max-w-4xl px-6"
				>
					<h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8">
						{title}
					</h1>
					<motion.a
						href={slug ? `/${slug}` : "#"}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="inline-block bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-colors"
					>
						{action_text}
					</motion.a>
				</motion.div>
			</div>
		</section>
	);
}

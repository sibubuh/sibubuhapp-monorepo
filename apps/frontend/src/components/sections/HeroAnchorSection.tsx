import { motion } from "motion/react";
import type { HeroAnchorSection } from "../../types/sections/hero-anchor";

export default function HeroAnchorSectionComponent({
	title,
	action_text,
	slug,
	image,
}: HeroAnchorSection) {
	return (
		<section className="relative h-[60vh] overflow-hidden bg-ink md:h-[70vh]">
			<img
				src={image.url}
				className="absolute inset-0 h-full w-full object-cover opacity-50"
				alt=""
			/>
			<div className="absolute inset-0 flex items-center justify-center">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="max-w-4xl px-6 text-center text-white"
				>
					<h1 className="mb-8 font-serif text-4xl font-medium text-balance text-white md:text-6xl">
						{title}
					</h1>
					<motion.a
						href={slug ? `/${slug}` : "#"}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="inline-block rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						{action_text}
					</motion.a>
				</motion.div>
			</div>
		</section>
	);
}

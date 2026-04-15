import { motion } from "motion/react";
import type { QuoteSection } from "../../types/sections/quote";

export default function QuoteSectionComponent({
	text,
	author,
	role,
	divider,
}: QuoteSection) {
	return (
		<section className="py-24 md:py-32 px-6 bg-neutral-900">
			<motion.div
				initial={{ opacity: 0, y: 50 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.8 }}
				className="max-w-4xl mx-auto text-center"
			>
				{divider && <div className="w-16 h-1 bg-indigo-500 mx-auto mb-12" />}
				<blockquote className="text-3xl md:text-4xl font-medium text-white leading-relaxed mb-8">
					"{text}"
				</blockquote>
				<div className="flex flex-col items-center">
					<span className="text-xl font-bold text-white">{author}</span>
					{role && <span className="text-neutral-400">{role}</span>}
				</div>
			</motion.div>
		</section>
	);
}

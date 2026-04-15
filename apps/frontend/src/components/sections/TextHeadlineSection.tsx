import { motion } from "motion/react";
import type { TextHeadlineSection } from "../../types/sections/text-headline";

export default function TextHeadlineSectionComponent({
	title,
	divider,
}: TextHeadlineSection) {
	return (
		<section className="py-16 md:py-24 px-6 bg-white">
			<div className="max-w-7xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8 }}
					className="text-center"
				>
					{divider && <div className="w-16 h-1 bg-indigo-500 mx-auto mb-8" />}
					<h2 className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-900">
						{title}
					</h2>
				</motion.div>
			</div>
		</section>
	);
}

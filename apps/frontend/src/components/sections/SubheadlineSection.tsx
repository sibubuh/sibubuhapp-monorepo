import { motion } from "motion/react";
import type { SubheadlineSection } from "../../types/sections/subheadline";

export default function SubheadlineSectionComponent({
	text,
}: SubheadlineSection) {
	return (
		<section className="py-12 md:py-16 px-6 bg-neutral-50">
			<div className="max-w-4xl mx-auto text-center">
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8 }}
					className="text-xl md:text-2xl text-neutral-600 leading-relaxed"
				>
					{text}
				</motion.p>
			</div>
		</section>
	);
}

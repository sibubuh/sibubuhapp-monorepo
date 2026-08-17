import { motion } from "motion/react";
import type { SubheadlineSection } from "../../types/sections/subheadline";

export default function SubheadlineSectionComponent({ text }: SubheadlineSection) {
	return (
		<section className="bg-background py-12 md:py-16">
			<div className="mx-auto max-w-4xl px-6 text-center">
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8 }}
					className="text-xl leading-relaxed text-muted-foreground md:text-2xl"
				>
					{text}
				</motion.p>
			</div>
		</section>
	);
}

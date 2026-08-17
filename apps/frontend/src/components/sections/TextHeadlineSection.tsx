import { motion } from "motion/react";
import type { TextHeadlineSection } from "../../types/sections/text-headline";

export default function TextHeadlineSectionComponent({
	title,
	divider,
}: TextHeadlineSection) {
	return (
		<section className="bg-background py-16 md:py-24">
			<div className="mx-auto max-w-7xl px-6">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8 }}
					className="text-center"
				>
					{divider && <div className="mx-auto mb-8 h-1 w-16 bg-primary" />}
					<h2 className="font-serif text-4xl font-medium text-balance text-foreground md:text-6xl">
						{title}
					</h2>
				</motion.div>
			</div>
		</section>
	);
}

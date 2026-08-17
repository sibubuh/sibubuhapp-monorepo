import { motion } from "motion/react";
import type { QuoteSection } from "../../types/sections/quote";

export default function QuoteSectionComponent({
	text,
	author,
	role,
	divider,
}: QuoteSection) {
	return (
		<section className="bg-ink py-24 md:py-32 px-6">
			<motion.div
				initial={{ opacity: 0, y: 50 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.8 }}
				className="mx-auto max-w-4xl text-center"
			>
				{divider && <div className="mx-auto mb-12 h-1 w-16 bg-primary" />}
				<blockquote className="mb-8 font-serif text-3xl font-medium leading-relaxed text-ink-foreground md:text-4xl">
					"{text}"
				</blockquote>
				<div className="flex flex-col items-center">
					<span className="text-xl font-medium text-ink-foreground">{author}</span>
					{role && <span className="text-ink-muted">{role}</span>}
				</div>
			</motion.div>
		</section>
	);
}

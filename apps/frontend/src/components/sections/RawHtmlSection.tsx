import { motion } from "motion/react";
import type { RawHtmlSection } from "../../types/sections/raw-html";

export default function RawHtmlSectionComponent({ content }: RawHtmlSection) {
	return (
		<section className="py-24 md:py-32 px-6 bg-white">
			<div className="max-w-7xl mx-auto">
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
					dangerouslySetInnerHTML={{ __html: content }}
				/>
			</div>
		</section>
	);
}

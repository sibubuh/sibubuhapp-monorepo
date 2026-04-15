import { motion } from "motion/react";
import type { RichTextSection } from "../../types/sections/rich-text-section";
import StrapiBlocks from "./StrapiBlocks";

export default function RichTextSectionComponent({ content }: RichTextSection) {
	return (
		<section className="py-24 md:py-32 px-6 bg-white">
			<motion.div
				initial={{ opacity: 0, y: 50 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.8 }}
				className="max-w-4xl mx-auto"
			>
				<StrapiBlocks data={content} />
			</motion.div>
		</section>
	);
}

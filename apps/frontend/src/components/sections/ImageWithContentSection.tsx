import { motion } from "motion/react";
import type { ImageWithContentSection } from "../../types/sections/image-with-content";
import StrapiBlocks from "./StrapiBlocks";

export default function ImageWithContentSectionComponent({
	image,
	content,
}: ImageWithContentSection) {
	return (
		<section className="bg-background py-24 md:py-32">
			<div className="mx-auto max-w-7xl px-6">
				<div className="grid items-center gap-16 lg:grid-cols-2">
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8 }}
						className="order-2 aspect-[4/3] overflow-hidden rounded-xl shadow-card lg:order-1"
					>
						<img src={image.url} alt="" className="h-full w-full object-cover" />
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="order-1 lg:order-2"
					>
						<StrapiBlocks data={content} />
					</motion.div>
				</div>
			</div>
		</section>
	);
}

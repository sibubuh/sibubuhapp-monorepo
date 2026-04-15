import { motion } from "motion/react";
import type { ImageWithContentSection } from "../../types/sections/image-with-content";
import StrapiBlocks from "./StrapiBlocks";

export default function ImageWithContentSectionComponent({
	image,
	content,
}: ImageWithContentSection) {
	return (
		<section className="py-24 md:py-32 px-6 bg-white">
			<div className="max-w-7xl mx-auto">
				<div className="grid lg:grid-cols-2 gap-16 items-center">
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8 }}
						className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl order-2 lg:order-1"
					>
						<img
							src={image.url}
							alt=""
							className="w-full h-full object-cover"
						/>
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

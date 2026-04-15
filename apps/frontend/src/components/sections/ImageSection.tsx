import { motion } from "motion/react";
import type { ImageSection } from "../../types/sections/image";

export default function ImageSectionComponent({ image }: ImageSection) {
	return (
		<section className="w-full">
			<motion.div
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true }}
				transition={{ duration: 1 }}
				className="w-full h-auto"
			>
				<img src={image.url} alt="" className="w-full h-auto object-cover" />
			</motion.div>
		</section>
	);
}

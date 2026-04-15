import { motion } from "motion/react";
import type { AboutUsSection } from "../../types/sections/about-us";
import StrapiBlocks from "./StrapiBlocks";

export default function AboutUsSectionComponent({
	title,
	content,
	banner,
	maps_lottie,
	content2,
}: AboutUsSection) {
	return (
		<section className="py-24 md:py-32">
			<motion.div
				initial={{ opacity: 0, y: 50 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.8 }}
				className="max-w-7xl mx-auto px-6 mb-16"
			>
				<h2 className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-900 mb-8">
					{title}
				</h2>
				<StrapiBlocks data={content} />
			</motion.div>

			{banner && (
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 1 }}
					className="w-full h-[50vh] md:h-[60vh]"
				>
					<img
						src={banner.url}
						alt={title}
						className="w-full h-full object-cover"
					/>
				</motion.div>
			)}

			{maps_lottie && (
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 1 }}
					className="max-w-7xl mx-auto px-6 mt-16"
				>
					<img
						src={maps_lottie.url}
						alt="Map or Animation"
						className="w-full rounded-3xl"
					/>
				</motion.div>
			)}

			{content2 && (
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8 }}
					className="max-w-7xl mx-auto px-6 mt-16"
				>
					<StrapiBlocks data={content2} />
				</motion.div>
			)}
		</section>
	);
}

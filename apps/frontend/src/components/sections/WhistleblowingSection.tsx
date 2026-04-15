import { motion } from "motion/react";
import type { WhistleblowingSection } from "../../types/sections/whistleblowing";
import StrapiBlocks from "./StrapiBlocks";

export default function WhistleblowingSectionComponent({
	title,
	description1,
	description2,
	image,
	contact_title,
	blocks,
}: WhistleblowingSection) {
	return (
		<section className="py-24 md:py-32">
			<motion.div
				initial={{ opacity: 0, y: 50 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.8 }}
				className="max-w-7xl mx-auto px-6 mb-16"
			>
				<h2 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-8">
					{title}
				</h2>
				<div className="grid lg:grid-cols-2 gap-16">
					<StrapiBlocks data={description1} />
					<StrapiBlocks data={description2} />
				</div>
			</motion.div>

			<motion.div
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true }}
				transition={{ duration: 1 }}
				className="w-full h-[40vh] md:h-[50vh]"
			>
				<img
					src={image.url}
					alt={title}
					className="w-full h-full object-cover"
				/>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 50 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.8 }}
				className="max-w-7xl mx-auto px-6 mt-16"
			>
				<h3 className="text-2xl font-bold text-neutral-900 mb-8">
					{contact_title}
				</h3>
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
					{blocks?.map((block, index) => (
						<div key={index} className="text-center">
							<img
								src={block.image.url}
								alt={block.text}
								className="w-16 h-16 object-contain mx-auto mb-4"
							/>
							<p className="text-neutral-700 font-medium">{block.text}</p>
						</div>
					))}
				</div>
			</motion.div>
		</section>
	);
}

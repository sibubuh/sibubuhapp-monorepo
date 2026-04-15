import { motion } from "motion/react";
import type { InformationSupportSection } from "../../types/sections/information-support";
import StrapiBlocks from "./StrapiBlocks";

export default function InformationSupportSectionComponent({
	blocks,
}: InformationSupportSection) {
	if (!blocks || blocks.length === 0) return null;

	return (
		<section className="py-24 md:py-32 px-6 bg-white">
			<div className="max-w-7xl mx-auto">
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{blocks.map((block, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							className="bg-neutral-50 p-8 rounded-2xl"
						>
							<h3 className="text-xl font-bold text-neutral-900 mb-4">
								{block.title}
							</h3>
							<StrapiBlocks data={block.description} className="mb-6" />
							{block.block_detail && block.block_detail.length > 0 && (
								<div className="space-y-3">
									{block.block_detail.map((item, itemIndex) => (
										<div key={itemIndex} className="flex items-center gap-3">
											{item.icon?.url && (
												<img
													src={item.icon.url}
													alt=""
													className="w-6 h-6 object-contain"
												/>
											)}
											<a
												href={item.href || "#"}
												className="text-indigo-500 hover:text-indigo-700 transition-colors"
											>
												{item.title}
											</a>
										</div>
									))}
								</div>
							)}
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

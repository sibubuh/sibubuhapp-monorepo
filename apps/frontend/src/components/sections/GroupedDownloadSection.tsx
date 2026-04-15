import { motion } from "motion/react";
import type { GroupedDownloadSection } from "../../types/sections/grouped-download-item";

export default function GroupedDownloadSectionComponent({
	groups,
}: GroupedDownloadSection) {
	if (!groups || groups.length === 0) return null;

	return (
		<section className="py-24 md:py-32 px-6 bg-white">
			<div className="max-w-7xl mx-auto">
				<div className="space-y-12">
					{groups.map((group, groupIndex) => (
						<motion.div
							key={groupIndex}
							initial={{ opacity: 0, y: 50 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
						>
							<h3 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
								<span className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-sm">
									{groupIndex + 1}
								</span>
								{group.label}
							</h3>
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pl-11">
								{group.items.map((item, itemIndex) => (
									<motion.a
										key={itemIndex}
										href={item.file.url}
										initial={{ opacity: 0, x: -20 }}
										whileInView={{ opacity: 1, x: 0 }}
										viewport={{ once: true }}
										transition={{ duration: 0.3, delay: itemIndex * 0.05 }}
										whileHover={{ x: 5 }}
										className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
									>
										<svg
											className="w-5 h-5 text-indigo-500 flex-shrink-0"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
											/>
										</svg>
										<span className="text-neutral-700 font-medium">
											{item.title}
										</span>
									</motion.a>
								))}
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

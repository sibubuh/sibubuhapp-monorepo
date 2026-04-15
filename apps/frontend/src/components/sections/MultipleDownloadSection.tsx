import { motion } from "motion/react";
import type { MultipleDownloadSection } from "../../types/sections/multiple-download-item";

export default function MultipleDownloadSectionComponent({
	items,
}: MultipleDownloadSection) {
	if (!items || items.length === 0) return null;

	return (
		<section className="py-24 md:py-32 px-6 bg-neutral-50">
			<div className="max-w-7xl mx-auto">
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{items.map((item, index) => (
						<motion.a
							key={index}
							href={item.file.url}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							whileHover={{ y: -5 }}
							className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex items-center gap-4"
						>
							<div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
								<svg
									className="w-6 h-6 text-indigo-500"
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
							</div>
							<span className="font-semibold text-neutral-900">
								{item.title}
							</span>
						</motion.a>
					))}
				</div>
			</div>
		</section>
	);
}

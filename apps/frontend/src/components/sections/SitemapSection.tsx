import { motion } from "motion/react";
import type { SitemapSection } from "../../types/sections/sitemap";

export default function SitemapSectionComponent({
	sitemap_list,
}: SitemapSection) {
	if (!sitemap_list || sitemap_list.length === 0) return null;

	return (
		<section className="py-24 md:py-32 px-6 bg-white">
			<div className="max-w-7xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8 }}
					className="grid md:grid-cols-2 lg:grid-cols-3 gap-12"
				>
					{sitemap_list.map((item, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
						>
							<h3 className="text-xl font-bold text-neutral-900 mb-4">
								{item.href ? (
									<a
										href={item.href}
										className="hover:text-indigo-500 transition-colors"
									>
										{item.title}
									</a>
								) : (
									item.title
								)}
							</h3>
							{item.items && item.items.length > 0 && (
								<ul className="space-y-2">
									{item.items.map((subItem, subIndex) => (
										<li key={subIndex}>
											<a
												href={subItem.href || "#"}
												className="text-neutral-600 hover:text-indigo-500 transition-colors"
											>
												{subItem.title}
											</a>
										</li>
									))}
								</ul>
							)}
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}

import { motion } from "motion/react";
import type { PartnersSection } from "../../types/sections/partners";

export default function PartnersSectionComponent({
	title,
	image,
	description,
	link,
}: PartnersSection) {
	return (
		<section className="py-24 md:py-32 px-6 bg-white">
			<div className="max-w-7xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8 }}
					className="text-center mb-16"
				>
					<h2 className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-900 mb-6">
						{title}
					</h2>
					<img
						src={image.url}
						alt={title}
						className="max-h-32 mx-auto object-contain mb-8"
					/>
					<p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-8">
						{description}
					</p>
					{link && (
						<a
							href={link.href || "#"}
							className="inline-block bg-neutral-900 text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-indigo-500 transition-colors"
						>
							{link.title}
						</a>
					)}
				</motion.div>
			</div>
		</section>
	);
}

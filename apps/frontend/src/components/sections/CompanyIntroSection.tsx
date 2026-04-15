import { motion } from "motion/react";
import type { CompanyIntroSection } from "../../types/sections/company-intro";

export default function CompanyIntroSectionComponent({
	title,
	secondary_title,
	description,
	link,
	image,
}: CompanyIntroSection) {
	return (
		<section className="py-24 md:py-32 px-6 bg-white">
			<div className="max-w-7xl mx-auto">
				<div className="grid md:grid-cols-2 gap-16 items-center">
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8 }}
					>
						<h2 className="text-4xl md:text-5xl font-bold mb-4 text-neutral-900">
							{title}
						</h2>
						{secondary_title && (
							<p className="text-2xl text-indigo-500 font-semibold mb-6">
								{secondary_title}
							</p>
						)}
						<p className="text-lg text-neutral-600 leading-relaxed mb-8">
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

					<motion.div
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="relative"
					>
						<div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
							<img
								src={image.url}
								alt={title}
								className="w-full h-full object-cover"
							/>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}

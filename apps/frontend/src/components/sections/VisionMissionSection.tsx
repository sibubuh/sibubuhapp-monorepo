import { motion } from "motion/react";
import type { VisionMissionSection } from "../../types/sections/vision-mission";

export default function VisionMissionSectionComponent({
	vision_label,
	vision,
	mission_label,
	mission,
}: VisionMissionSection) {
	return (
		<section className="py-24 md:py-32 px-6 bg-neutral-50">
			<div className="max-w-7xl mx-auto">
				<div className="grid md:grid-cols-2 gap-16">
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8 }}
						className="bg-white p-12 rounded-3xl shadow-lg"
					>
						<span className="text-sm uppercase tracking-[0.3em] text-indigo-500 font-bold">
							{vision_label}
						</span>
						<p className="mt-4 text-2xl text-neutral-800 leading-relaxed">
							{vision}
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="bg-neutral-900 p-12 rounded-3xl"
					>
						<span className="text-sm uppercase tracking-[0.3em] text-indigo-400 font-bold">
							{mission_label}
						</span>
						<ul className="mt-4 space-y-4">
							{mission?.map((item, index) => (
								<li key={index} className="flex items-start gap-4">
									<span className="w-2 h-2 bg-indigo-500 rounded-full mt-3 flex-shrink-0" />
									<span className="text-xl text-neutral-300">{item.text}</span>
								</li>
							))}
						</ul>
					</motion.div>
				</div>
			</div>
		</section>
	);
}

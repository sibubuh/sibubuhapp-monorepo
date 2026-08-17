import { motion } from "motion/react";
import type { VisionMissionSection } from "../../types/sections/vision-mission";
import { Container } from "../ui/Container";
import { Eyebrow } from "../ui/Eyebrow";

export default function VisionMissionSectionComponent({
	vision_label,
	vision,
	mission_label,
	mission,
}: VisionMissionSection) {
	return (
		<section className="bg-background py-24 md:py-32">
			<Container>
				<div className="grid gap-12 md:grid-cols-2">
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8 }}
						className="rounded-xl border border-border bg-card p-12 shadow-card"
					>
						<Eyebrow>{vision_label}</Eyebrow>
						<p className="mt-4 text-2xl leading-relaxed text-foreground">
							{vision}
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="rounded-xl bg-ink p-12"
					>
						<Eyebrow>{mission_label}</Eyebrow>
						<ul className="mt-4 space-y-4">
							{mission?.map((item, index) => (
								<li key={index} className="flex items-start gap-4">
									<span className="mt-3 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
									<span className="text-xl text-ink-foreground">{item.text}</span>
								</li>
							))}
						</ul>
					</motion.div>
				</div>
			</Container>
		</section>
	);
}

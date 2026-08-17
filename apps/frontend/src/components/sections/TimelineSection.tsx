import { motion } from "motion/react";
import ScrollZoomTimeline from "../ui/TimelineSection";
import type { TimelineEvent } from "../ui/TimelineSection";
import type { TimelineSection as TimelineSectionType } from "../../types/sections/timeline";

export default function TimelineSectionComponent({ title, items }: TimelineSectionType) {
	const events: TimelineEvent[] = items.map((item) => ({
		year: item.year,
		month: item.month,
		title: item.title,
		body: item.body,
		accent: item.accent,
		tag: item.tag,
		tagBg: item.tagBg,
		tagColor: item.tagColor,
	}));

	return (
		<>
			{title && (
				<section className="bg-background py-16 md:py-24">
					<div className="mx-auto max-w-7xl px-6">
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.8 }}
							className="text-center"
						>
							<h2 className="font-serif text-4xl font-medium text-foreground md:text-6xl">
								{title}
							</h2>
						</motion.div>
					</div>
				</section>
			)}
			<ScrollZoomTimeline events={events} />
		</>
	);
}

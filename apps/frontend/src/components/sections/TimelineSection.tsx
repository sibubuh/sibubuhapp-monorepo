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
        <section className="py-16 md:py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-900">
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
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Calendar, Tag } from "lucide-react";
import { motion } from "motion/react";
import { strapiImage } from "../../../libs/strapi-image";
import type { Story } from "../../../types/story";

/** Cards sit in a three-column grid on desktop, one column on phones. */
const CARD_SIZES = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

function formatDate(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleDateString("id-ID", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

export default function StoryCard({
	story,
	index = 0,
}: {
	story: Story;
	index?: number;
}) {
	const thumbnail = strapiImage(story.thumbnail);
	const mainLabel = story.labels?.[0] || "Blog";

	return (
		<motion.div
			initial={{ opacity: 0, y: 30 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			// Stagger only within a row; a long list should not fade in for seconds.
			transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
		>
			<Link
				to="/stories/$slug"
				params={{ slug: story.slug }}
				className="block h-full"
			>
				<div className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
					<div className="relative aspect-[16/10] overflow-hidden bg-muted">
						{thumbnail ? (
							<img
								src={thumbnail.src}
								srcSet={thumbnail.srcSet}
								sizes={CARD_SIZES}
								width={thumbnail.width}
								height={thumbnail.height}
								alt={story.title}
								className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
								loading="lazy"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-background">
								<span className="text-xs uppercase tracking-widest text-muted-foreground">
									No Image
								</span>
							</div>
						)}

						<div className="absolute left-3 top-3">
							<span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-2.5 py-0.5 text-xs text-muted-foreground backdrop-blur-sm">
								<Tag className="h-2.5 w-2.5" />
								{mainLabel}
							</span>
						</div>
					</div>

					<div className="flex flex-1 flex-col p-6">
						<div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
							<Calendar className="h-3 w-3" />
							<span>{formatDate(story.publishedDate)}</span>
						</div>

						<h3 className="mb-3 line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors duration-300 group-hover:text-primary">
							{story.title}
						</h3>

						{story.excerpt && (
							<p className="mb-6 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
								{story.excerpt}
							</p>
						)}

						<div className="mt-auto flex items-center justify-between border-t border-border pt-4">
							<span className="text-xs text-muted-foreground">bubuh.id</span>
							<span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors duration-300 group-hover:text-primary">
								Baca Selengkapnya
								<ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
							</span>
						</div>
					</div>
				</div>
			</Link>
		</motion.div>
	);
}

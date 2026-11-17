import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import StoryCard from "../stories/StoryCard";
import type { Story } from "../../../types/story";

interface RecentStoriesSectionProps {
	title?: string;
	subtitle?: string;
	showViewAll?: boolean;
	/**
	 * Fetched by the route loader, not by a useEffect here, so the titles and
	 * excerpts are in the server-rendered HTML that crawlers read first.
	 */
	stories?: Story[] | null;
}

export default function RecentStoriesSection({
	title = "My Story",
	subtitle = "Story about me, my work, and my journey in the digital world.",
	showViewAll = true,
	stories = null,
}: RecentStoriesSectionProps) {
	return (
		<section className="bg-muted px-6 py-20 md:py-28">
			<div className="mx-auto max-w-7xl">
				<div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
					<div>
						<h2 className="font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl">
							{title}
						</h2>
						<p className="mt-3 max-w-xl font-sans text-base leading-relaxed text-muted-foreground">
							{subtitle}
						</p>
					</div>

					{showViewAll && (
						<Link
							to="/stories"
							className="inline-flex shrink-0 items-center gap-2 font-sans text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-current"
						>
							Lihat Semua Cerita
							<ArrowRight className="h-4 w-4" />
						</Link>
					)}
				</div>

				{stories === null || stories.length === 0 ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="py-20 text-center"
					>
						<p className="font-sans text-base text-muted-foreground">
							{stories === null
								? "Gagal memuat cerita. Silakan coba lagi nanti."
								: "Tidak ada cerita yang ditemukan."}
						</p>
					</motion.div>
				) : (
					<div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
						{stories.map((story, index) => (
							<StoryCard key={story.id} story={story} index={index} />
						))}
					</div>
				)}
			</div>
		</section>
	);
}

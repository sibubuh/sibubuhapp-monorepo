"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ExternalLink, AlertCircle } from "lucide-react";
import BubuhBlogCard from "../ui/BubuhBlogCard";
import BubuhBlogCardSkeleton from "../ui/BubuhBlogCardSkeleton";
import { getRecentBubuhBlogs } from "../../services/bubuhApi";
import type { BubuhBlogPost } from "../../types/bubuh";

interface RecentBlogsSectionProps {
	title?: string;
	subtitle?: string;
	limit?: number;
	showViewAll?: boolean;
}

export default function RecentBlogsSection({
	title = "Blog dari Bubuh.id",
	subtitle = "Artikel terbaru dari blog pribadi seputar fotografi, pariwisata, travel, dan gaya hidup di Sukabumi",
	limit = 6,
	showViewAll = true,
}: RecentBlogsSectionProps) {
	const [posts, setPosts] = useState<BubuhBlogPost[] | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchBlogs() {
			setError(null);

			try {
				const feed = await getRecentBubuhBlogs(limit);
				setPosts(feed.posts);
			} catch {
				setError("Gagal memuat artikel. Silakan coba lagi nanti.");
			}
		}

		fetchBlogs();
	}, [limit]);

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
						<a
							href="https://www.bubuh.id"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex shrink-0 items-center gap-2 font-sans text-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-current"
						>
							Lihat Semua di Bubuh.id
							<ExternalLink className="h-4 w-4" />
						</a>
					)}
				</div>

				{error ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="flex flex-col items-center justify-center gap-3 py-20 text-center"
					>
						<AlertCircle className="h-6 w-6 text-destructive" />
						<p className="font-sans text-base text-muted-foreground">{error}</p>
					</motion.div>
				) : (
					<>
						<div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
							{posts === null ? (
								<BubuhBlogCardSkeleton count={limit} />
							) : (
								posts.map((post, index) => (
									<BubuhBlogCard key={post.id} post={post} index={index} />
								))
							)}
						</div>

						{posts !== null && posts.length === 0 && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="py-20 text-center"
							>
								<p className="font-sans text-base text-muted-foreground">
									Tidak ada artikel yang ditemukan.
								</p>
							</motion.div>
						)}
					</>
				)}
			</div>
		</section>
	);
}

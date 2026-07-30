"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ExternalLink, AlertCircle, PenLine, BookOpen, Feather, BookMarked, MessageCircle } from "lucide-react";
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

const EASE = [0.22, 1, 0.36, 1] as const;

const storyIcons = [
	{ icon: PenLine, position: "top-12 left-[8%] md:left-[12%]", animate: { x: [0, 5, 0], y: [0, -7, 0] }, delay: 0 },
	{ icon: BookOpen, position: "top-12 right-[8%] md:right-[12%]", animate: { x: [0, -5, 0], y: [0, -9, 0] }, delay: 0.15 },
	{ icon: Feather, position: "bottom-12 left-[8%] md:left-[12%]", animate: { x: [0, 6, 0], y: [0, 5, 0] }, delay: 0.3 },
	{ icon: BookMarked, position: "bottom-12 right-[8%] md:right-[12%]", animate: { x: [0, -7, 0], y: [0, 6, 0] }, delay: 0.45 },
	{ icon: MessageCircle, position: "top-1/3 right-[4%] md:right-[6%]", animate: { x: [0, 3, 0], y: [0, -8, 3, 0] }, delay: 0.6 },
];

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
		<section className="relative py-20 md:py-28 bg-[#080C14] overflow-hidden">
			{storyIcons.map(({ icon: Icon, position, animate, delay }) => (
				<motion.div
					key={position}
					className={`absolute ${position}`}
					initial={{ opacity: 0, scale: 0.6 }}
					whileInView={{ opacity: 1, scale: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.7, ease: EASE, delay }}
				>
					<motion.div
						animate={animate}
						transition={{
							duration: 4,
							repeat: Infinity,
							repeatType: "reverse",
							ease: EASE,
							delay,
						}}
					>
						<Icon className="w-7 h-7 md:w-9 md:h-9 text-white/10" />
					</motion.div>
				</motion.div>
			))}

			<div className="px-6 max-w-screen-xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="text-center mb-12"
				>
					<h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
						{title}
					</h2>
					<p className="text-lg text-neutral-500 max-w-2xl mx-auto">
						{subtitle}
					</p>
				</motion.div>

				{error ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="flex flex-col items-center justify-center py-16 text-center"
					>
						<AlertCircle className="w-12 h-12 text-red-400 mb-4" />
						<p className="text-neutral-600">{error}</p>
					</motion.div>
				) : (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
							{posts === null ? (
								<BubuhBlogCardSkeleton count={limit} />
							) : (
								posts.map((post, index) => (
									<BubuhBlogCard key={post.id} post={post} index={index} />
								))
							)}
						</div>

						{posts !== null && posts.length === 0 && !error && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="flex flex-col items-center justify-center py-16 text-center"
							>
								<p className="text-neutral-500">
									Tidak ada artikel yang ditemukan.
								</p>
								<p className="text-sm text-neutral-400 mt-2">
									Cek console browser untuk detail error.
								</p>
							</motion.div>
						)}

						{showViewAll && posts !== null && posts.length > 0 && (
							<motion.div
								initial={{ opacity: 0 }}
								whileInView={{ opacity: 1 }}
								viewport={{ once: true }}
								transition={{ delay: 0.3 }}
								className="text-center"
							>
								<a
									href="https://www.bubuh.id"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white font-medium rounded-full hover:bg-indigo-600 transition-colors"
								>
									Lihat Semua di Bubuh.id
									<ExternalLink className="w-4 h-4" />
								</a>
							</motion.div>
						)}
					</>
				)}
			</div>
		</section>
	);
}

import { motion } from "motion/react";
import { ExternalLink, Calendar, Tag } from "lucide-react";
import type { BubuhBlogPost } from "../../types/bubuh";
import { formatBlogDate } from "../../services/bubuhApi";

interface BubuhBlogCardProps {
	post: BubuhBlogPost;
	index?: number;
}

export default function BubuhBlogCard({ post, index = 0 }: BubuhBlogCardProps) {
	const mainCategory = post.categories[0] || "Blog";

	return (
		<motion.a
			href={post.link}
			target="_blank"
			rel="noopener noreferrer"
			initial={{ opacity: 0, y: 30 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.5, delay: index * 0.1 }}
			className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
		>
			<div className="aspect-[16/10] overflow-hidden bg-neutral-100">
				{post.thumbnail ? (
					<img
						src={post.thumbnail.url}
						alt={post.title}
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
						loading="lazy"
					/>
				) : (
					<div className="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
						<span className="text-neutral-400 text-sm">No Image</span>
					</div>
				)}
			</div>

			<div className="p-5">
				<div className="flex items-center gap-3 mb-3">
					<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
						<Tag className="w-3 h-3" />
						{mainCategory}
					</span>
					<span className="inline-flex items-center gap-1.5 text-neutral-400 text-xs">
						<Calendar className="w-3 h-3" />
						{formatBlogDate(post.published)}
					</span>
				</div>

				<h3 className="text-lg font-bold text-neutral-900 line-clamp-2 group-hover:text-amber-600 transition-colors mb-2">
					{post.title}
				</h3>

				<p className="text-sm text-neutral-500 line-clamp-2 mb-4">
					{post.summary}
				</p>

				<div className="flex items-center justify-between">
					<span className="text-xs text-neutral-400">bubah.id</span>
					<span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 group-hover:gap-2 transition-all">
						Baca Selengkapnya
						<ExternalLink className="w-3 h-3" />
					</span>
				</div>
			</div>
		</motion.a>
	);
}

import { motion } from "motion/react";
import { ArrowUpRight, Calendar, Tag } from "lucide-react";
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
			className="group block bg-white rounded-2xl overflow-hidden hover:shadow-[0_8px_40px_rgba(99,102,241,0.15)] transition-all duration-500"
		>
			{/* Thumbnail */}
			<div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
				{post.thumbnail ? (
					<img
						src={post.thumbnail.url}
						alt={post.title}
						className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
						loading="lazy"
					/>
				) : (
					<div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
						<span className="text-slate-400 text-xs tracking-widest uppercase">No Image</span>
					</div>
				)}

				{/* Category badge overlay */}
				<div className="absolute top-3 left-3">
					<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-sm text-indigo-600 text-[10px] font-semibold rounded-full uppercase tracking-widest shadow-sm">
						<Tag className="w-2.5 h-2.5" />
						{mainCategory}
					</span>
				</div>
			</div>

			{/* Content */}
			<div className="p-6">
				{/* Date */}
				<div className="flex items-center gap-1.5 text-slate-400 text-xs mb-3">
					<Calendar className="w-3 h-3" />
					<span className="tracking-wide">{formatBlogDate(post.published)}</span>
				</div>

				{/* Title */}
				<h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300 leading-snug mb-3">
					{post.title}
				</h3>

				{/* Summary */}
				<p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-6">
					{post.summary}
				</p>

				{/* Footer row */}
				<div className="flex items-center justify-between pt-4 border-t border-slate-100">
					<span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium">
						bubuh.id
					</span>
					<span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 group-hover:text-indigo-600 transition-all duration-300">
						Baca Selengkapnya
						<ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
					</span>
				</div>
			</div>
		</motion.a>
	);
}

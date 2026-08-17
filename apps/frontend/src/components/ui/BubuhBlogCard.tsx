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
		<motion.div
			initial={{ opacity: 0, y: 30 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.5, delay: index * 0.1 }}
		>
			<a href={post.link} target="_blank" rel="noopener noreferrer" className="block">
				<div className="group rounded-xl border border-border bg-card overflow-hidden">
					<div className="aspect-[16/10] overflow-hidden bg-muted relative">
						{post.thumbnail ? (
							<img
								src={post.thumbnail.url}
								alt={post.title}
								className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
								loading="lazy"
							/>
						) : (
							<div className="w-full h-full bg-gradient-to-br from-muted to-background flex items-center justify-center">
								<span className="text-muted-foreground text-xs tracking-widest uppercase">
									No Image
								</span>
							</div>
						)}

						<div className="absolute top-3 left-3">
							<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-card/80 backdrop-blur-sm border border-border text-muted-foreground text-xs rounded-full">
								<Tag className="w-2.5 h-2.5" />
								{mainCategory}
							</span>
						</div>
					</div>

					<div className="p-6">
						<div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-3">
							<Calendar className="w-3 h-3" />
							<span>{formatBlogDate(post.published)}</span>
						</div>

						<h3 className="text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-snug mb-3">
							{post.title}
						</h3>

						<p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-6">
							{post.summary}
						</p>

						<div className="flex items-center justify-between pt-4 border-t border-border">
							<span className="text-xs text-muted-foreground">bubuh.id</span>
							<span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors duration-300">
								Baca Selengkapnya
								<ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
							</span>
						</div>
					</div>
				</div>
			</a>
		</motion.div>
	);
}

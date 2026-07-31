import { useRef, useState, type MouseEvent } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Calendar, Tag } from "lucide-react";
import type { BubuhBlogPost } from "../../types/bubuh";
import { formatBlogDate } from "../../services/bubuhApi";

interface BubuhBlogCardProps {
	post: BubuhBlogPost;
	index?: number;
}

export default function BubuhBlogCard({ post, index = 0 }: BubuhBlogCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);
	const [rotateX, setRotateX] = useState(0);
	const [rotateY, setRotateY] = useState(0);
	const [glareX, setGlareX] = useState(50);
	const [glareY, setGlareY] = useState(50);
	const [isHovered, setIsHovered] = useState(false);

	const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
		if (!cardRef.current) return;
		const rect = cardRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;

		setRotateX(((y - centerY) / centerY) * -10);
		setRotateY(((x - centerX) / centerX) * 10);
		setGlareX((x / rect.width) * 100);
		setGlareY((y / rect.height) * 100);
	};

	const handleMouseLeave = () => {
		setRotateX(0);
		setRotateY(0);
		setIsHovered(false);
	};

	const mainCategory = post.categories[0] || "Blog";

	return (
		<motion.div
			initial={{ opacity: 0, y: 30 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.5, delay: index * 0.1 }}
		>
			<a
				href={post.link}
				target="_blank"
				rel="noopener noreferrer"
				className="block"
			>
				<div
					ref={cardRef}
					onMouseMove={handleMouseMove}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={handleMouseLeave}
					className="group relative bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden will-change-transform"
					style={{
						transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
						transition: isHovered ? "none" : "transform 0.5s ease",
					}}
				>
					{/* Glare follow mouse */}
					<div
						className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
						style={{
							opacity: isHovered ? 0.3 : 0,
							background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.9) 0%, transparent 60%)`,
						}}
					/>

					{/* Thumbnail */}
					<div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-zinc-800 relative">
						{post.thumbnail ? (
							<img
								src={post.thumbnail.url}
								alt={post.title}
								className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
								loading="lazy"
							/>
						) : (
							<div className="w-full h-full bg-gradient-to-br from-slate-100 dark:from-zinc-800 to-slate-200 dark:to-zinc-700 flex items-center justify-center">
								<span className="text-slate-400 dark:text-zinc-500 text-xs tracking-widest uppercase">No Image</span>
							</div>
						)}

						{/* Category badge overlay */}
						<div className="absolute top-3 left-3">
							<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-indigo-600 text-[10px] font-semibold rounded-full uppercase tracking-widest shadow-sm">
								<Tag className="w-2.5 h-2.5" />
								{mainCategory}
							</span>
						</div>
					</div>

					{/* Content */}
					<div className="p-6">
						<div className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-500 text-xs mb-3">
							<Calendar className="w-3 h-3" />
							<span className="tracking-wide">{formatBlogDate(post.published)}</span>
						</div>

						<h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300 leading-snug mb-3">
							{post.title}
						</h3>

						<p className="text-sm text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-6">
							{post.summary}
						</p>

						<div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
							<span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium">
								bubuh.id
							</span>
							<span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-zinc-500 group-hover:text-indigo-600 transition-all duration-300">
								Baca Selengkapnya
								<ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
							</span>
						</div>
					</div>
				</div>
			</a>
		</motion.div>
	);
}

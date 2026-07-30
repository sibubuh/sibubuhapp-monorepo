import { useRef, useState, type MouseEvent } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "../../../types/project";

interface ProjectCardProps {
	project: Project;
	index?: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);
	const [rotateX, setRotateX] = useState(0);
	const [rotateY, setRotateY] = useState(0);
	const [glareX, setGlareX] = useState(50);
	const [glareY, setGlareY] = useState(50);
	const [isHovered, setIsHovered] = useState(false);

	// @ts-ignore
	const coverImage = project.cover?.image?.url;
	const projectUrl = `/projects/${project.slug}`;
	const BASE_URL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;

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

	return (
		<motion.div
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.6, ease: EASE, delay: index * 0.08 }}
		>
			<a href={projectUrl} className="block">
				<div
					ref={cardRef}
					onMouseMove={handleMouseMove}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={handleMouseLeave}
					className="group relative rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden will-change-transform transition-shadow duration-500 hover:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.3)]"
					style={{
						transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
						transition: isHovered ? "none" : "transform 0.5s ease",
					}}
				>
					{/* Glare / spotlight */}
					<div
						className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 rounded-2xl"
						style={{
							opacity: isHovered ? 0.35 : 0,
							background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.7) 0%, transparent 60%)`,
						}}
					/>

					{/* Image */}
					<div className="aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
						{coverImage ? (
							<img
								src={`${BASE_URL}${coverImage}`}
								alt={project.title}
								className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-100 group-hover:scale-105 transition-all duration-700"
								loading="lazy"
							/>
						) : (
							<div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center">
								<span className="text-zinc-400 dark:text-zinc-500 text-xs tracking-widest uppercase">
									No Image
								</span>
							</div>
						)}

						{/* Category badge */}
						<div className="absolute top-3 left-3 z-20">
							<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-900 dark:text-zinc-100 text-[10px] font-semibold rounded-full uppercase tracking-widest shadow-sm border border-white/50 dark:border-zinc-700/50">
								{project.category}
							</span>
						</div>

						{/* Year badge */}
						{project.years && (
							<div className="absolute top-3 right-3 z-20">
								<span className="px-3 py-1 bg-black/60 backdrop-blur-sm text-white/90 text-[10px] font-semibold rounded-full uppercase tracking-widest">
									{project.years}
								</span>
							</div>
						)}
					</div>

					{/* Content */}
					<div className="p-6">
						<h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors duration-300 leading-snug mb-3">
							{project.title}
						</h3>

						{/* Accent bar on hover */}
						<div className="h-px bg-zinc-100 dark:bg-zinc-800 mb-3 overflow-hidden">
							<div className="h-full w-0 group-hover:w-full bg-gradient-to-r from-zinc-900 via-zinc-600 to-transparent dark:from-white dark:via-zinc-400 dark:to-transparent transition-all duration-500" />
						</div>

						<div className="flex items-center justify-between">
							<span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
								{new Date(project.createdAt).getFullYear() || "2026"}
							</span>
							<span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-all duration-300">
								View Project
								<ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
							</span>
						</div>
					</div>
				</div>
			</a>
		</motion.div>
	);
}

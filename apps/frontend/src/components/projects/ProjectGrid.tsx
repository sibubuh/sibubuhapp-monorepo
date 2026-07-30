import { useState } from "react";
import { motion } from "motion/react";
import type { Project, ProjectCategory } from "../../../types/project";
import ProjectCard from "./ProjectCard";
import TextAnimation from "../ui/staggerText";

const CATEGORIES: ProjectCategory[] = [
	"Branding",
	"Key Opinion Leader (KOL)",
	"Web Development",
	"Social Media Manager",
	"Public Speaking",
	"Educator",
];

interface ProjectGridProps {
	projects: Project[];
}

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ProjectGrid({ projects }: ProjectGridProps) {
	const [activeCategory, setActiveCategory] = useState<ProjectCategory | "All">(
		"All",
	);

	const filteredProjects =
		activeCategory === "All"
			? projects
			: projects.filter((p) => p.category === activeCategory);

	const BASE_URL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;
	const bg = `${BASE_URL}/uploads/slider_3_1e2c38dae4.jpg`;

	return (
		<div>
			{/* ===== HERO ===== */}
			<section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[65vh] min-h-[480px] flex items-center overflow-hidden mb-16">
				<img
					src={bg}
					alt=""
					className="absolute inset-0 w-full h-full object-cover"
				/>

				{/* Grid pattern overlay */}
				<div className="absolute inset-0 bg-[linear-gradient(to_right, rgba(255,255,255,0.06)_1px, transparent_1px), linear-gradient(to_bottom, rgba(255,255,255,0.06)_1px, transparent_1px)] bg-[size:64px_64px]" />

				{/* Gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />

				{/* Content */}
				<div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
					<motion.h1
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.7, ease: EASE }}
						className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6"
					>
						<TextAnimation>My Projects</TextAnimation>
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
						className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
					>
						<TextAnimation delay={0.15}>
							A collection of my work spanning branding, web development, KOL
							collaborations, and more.
						</TextAnimation>
					</motion.p>

					{/* Scroll indicator */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1, duration: 0.6 }}
						className="mt-12"
					>
						<motion.div
							animate={{ y: [0, 8, 0] }}
							transition={{ duration: 2, repeat: Infinity, ease: EASE }}
							className="w-5 h-8 rounded-full border border-white/30 mx-auto flex justify-center pt-2"
						>
							<div className="w-1 h-2 rounded-full bg-white/60" />
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* ===== FILTER ===== */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6, ease: EASE }}
				className="flex flex-wrap justify-center gap-3 mb-14 px-6"
			>
				<button
					onClick={() => setActiveCategory("All")}
					className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
						activeCategory === "All"
							? "bg-zinc-900 text-white shadow-lg shadow-zinc-200/50 dark:bg-white dark:text-zinc-900 dark:shadow-zinc-500/20"
							: "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
					}`}
				>
					All Projects
				</button>

				{CATEGORIES.map((category) => (
					<button
						key={category}
						onClick={() => setActiveCategory(category)}
						className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
							activeCategory === category
								? "bg-zinc-900 text-white shadow-lg shadow-zinc-200/50 dark:bg-white dark:text-zinc-900 dark:shadow-zinc-500/20"
								: "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
						}`}
					>
						{category}
					</button>
				))}
			</motion.div>

			{/* ===== GRID ===== */}
			<section className="relative px-6 pb-28">
				{/* Grid background pattern */}
				<div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:96px_96px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)]" />

				<div className="max-w-7xl mx-auto relative z-10">
					{filteredProjects.length === 0 ? (
						<div className="text-center py-20">
							<motion.p
								initial={{ opacity: 0 }}
								whileInView={{ opacity: 1 }}
								className="text-zinc-400 dark:text-zinc-500 text-lg"
							>
								No projects found in this category.
							</motion.p>
						</div>
					) : (
						<motion.div
							layout
							className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
						>
							{filteredProjects.map((project, index) => (
								<ProjectCard
									key={project.id}
									project={project}
									index={index}
								/>
							))}
						</motion.div>
					)}
				</div>
			</section>
		</div>
	);
}

import { useState } from "react";
import { motion } from "motion/react";
import type { Project, ProjectCategory } from "../../../types/project";
import ProjectCard from "./ProjectCard";

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

export default function ProjectGrid({ projects }: ProjectGridProps) {
	const [activeCategory, setActiveCategory] = useState<ProjectCategory | "All">(
		"All",
	);

	const filteredProjects =
		activeCategory === "All"
			? projects
			: projects.filter((p) => p.category === activeCategory);

  const BASE_URL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;
	const bg = `${BASE_URL}/uploads/slider_3_1e2c38dae4.jpg`; // Custom Image

	return (
		<div>
			{/* 🔥 FULL-WIDTH HERO */}
			<section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[60vh] min-h-[420px] flex items-center overflow-hidden mb-16">
				<motion.img
					src={bg}
					alt="Projects background"
					initial={{ scale: 1.1 }}
					animate={{ scale: 1 }}
					transition={{ duration: 1.2 }}
					className="absolute inset-0 w-full h-full object-cover"
				/>

				{/* Overlay */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

				{/* Content */}
				<div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
					<motion.h1
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.7 }}
						className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6"
					>
						My Projects
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="text-white/80 text-lg max-w-2xl mx-auto"
					>
						A collection of my work spanning branding, web development,
						KOL collaborations, and more.
					</motion.p>
				</div>
			</section>

			{/* 🔥 FILTER */}
			<div className="flex flex-wrap justify-center gap-3 mb-12 px-6">
				<button
					onClick={() => setActiveCategory("All")}
					className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
						activeCategory === "All"
							? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
							: "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
					}`}
				>
					All Projects
				</button>

				{CATEGORIES.map((category) => (
					<button
						key={category}
						onClick={() => setActiveCategory(category)}
						className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
							activeCategory === category
								? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
								: "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
						}`}
					>
						{category}
					</button>
				))}
			</div>

			{/* 🔥 GRID */}
			<div className="px-6 max-w-7xl mx-auto">
				{filteredProjects.length === 0 ? (
					<div className="text-center py-20">
						<p className="text-slate-400 text-lg">
							No projects found in this category.
						</p>
					</div>
				) : (
					<motion.div
						layout
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
		</div>
	);
}

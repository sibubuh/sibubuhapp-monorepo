import { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { getProjects } from "../../../services/api";
import type { Project } from "../../../types/project";

export default function PortfolioSlider() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(0);
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
  const BASE_URL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;

	useEffect(() => {
		const fetchProjects = async () => {
			try {
				const { data } = await getProjects({ locale: null, limit: 6 });
				setProjects(data);
			} catch (error) {
				console.error("Failed to fetch projects:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchProjects();
	}, []);

	useEffect(() => {
		if (containerRef.current) {
			const scrollWidth = containerRef.current.scrollWidth;
			const offsetWidth = containerRef.current.offsetWidth;
			setWidth(scrollWidth - offsetWidth);
		}
	}, [projects]);

	return (
		<section className="py-32 bg-white overflow-hidden">
			<div className="px-6 max-w-7xl mx-auto mb-16">
				<h2 className="text-5xl font-bold tracking-tight text-neutral-900">
					Recent Projects
				</h2>
			</div>

			<motion.div ref={containerRef} className="overflow-hidden">
				{loading ? (
					<div className="flex gap-10 px-6">
						{[1, 2, 3].map((i) => (
							<div key={i} className="min-w-[80vw] md:min-w-[450px]">
								<div className="aspect-[16/10] bg-neutral-200 rounded-[2rem] animate-pulse" />
								<div className="mt-6">
									<div className="h-8 w-48 bg-neutral-200 rounded animate-pulse" />
								</div>
							</div>
						))}
					</div>
				) : projects.length === 0 ? (
					<div className="px-6 text-neutral-400">No projects available.</div>
				) : (
					<motion.div
						drag="x"
						dragConstraints={{ left: -width, right: 0 }}
						className="flex gap-10 px-6 cursor-grab active:cursor-grabbing"
					>
						{projects.map((project, i) => (
							<motion.div
								key={project.id}
								whileHover={{ y: -15 }}
								className="min-w-[80vw] md:min-w-[450px] group"
							>
								<div className="aspect-[16/10] bg-neutral-100 rounded-[2rem] overflow-hidden">
									<img
                    src={`${BASE_URL}${project.cover?.image?.url}`}
										alt={project.title}
										className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
									/>
								</div>

								<div className="mt-6 flex justify-between items-start">
									<h3 className="text-2xl font-bold uppercase tracking-tighter">
										{project.title}
									</h3>
									<span className="text-neutral-400 font-mono">
										/ {project.years || "2026"}
									</span>
								</div>
							</motion.div>
						))}
					</motion.div>
				)}
			</motion.div>
		</section>
	);
}

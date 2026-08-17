import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { getProjects } from "../../../services/api";
import type { Project } from "../../../types/project";

function extractPlainText(content: unknown): string {
	if (!content) return "";
	if (typeof content === "string") return content.replace(/<[^>]*>/g, "").trim();
	if (Array.isArray(content)) {
		return content.map(extractPlainText).join(" ");
	}
	if (typeof content === "object" && "children" in content) {
		return extractPlainText((content as Record<string, unknown>).children);
	}
	if (typeof content === "object" && "text" in content) {
		return ((content as Record<string, unknown>).text as string) || "";
	}
	return "";
}

/** CMS images are relative paths; external covers (if any) are absolute URLs. */
const resolveSrc = (img: string, BASE_URL: string) =>
	/^(https?:)?\/\//.test(img) ? img : `${BASE_URL}${img}`;

function ProjectCard({
	project,
	index,
	BASE_URL,
}: {
	project: Project;
	index: number;
	BASE_URL: string;
}) {
	const descText = extractPlainText(project.description);

	return (
		<motion.div
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
		>
			<a href={`/projects/${project.slug}`} className="block">
				<div className="group rounded-xl border border-border bg-card overflow-hidden">
					<div className="aspect-[16/10] overflow-hidden bg-muted">
						<img
							src={resolveSrc(project.cover?.image?.url ?? "", BASE_URL)}
							alt={project.title}
							className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
							loading="lazy"
						/>
					</div>

					<div className="p-5 md:p-6">
						<div className="flex items-center justify-between mb-3">
							<span className="border border-border text-muted-foreground text-xs px-2.5 py-0.5 rounded-full">
								{project.category}
							</span>
							<span className="font-mono text-xs text-muted-foreground">
								{project.years || "2026"}
							</span>
						</div>

						<h3 className="font-serif text-lg md:text-xl font-medium text-foreground transition-colors group-hover:text-primary">
							{project.title}
						</h3>

						{descText && (
							<p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">
								{descText}
							</p>
						)}
					</div>
				</div>
			</a>
		</motion.div>
	);
}

export default function PortfolioSlider() {
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

	return (
		<section className="relative py-24 md:py-32 bg-background">
			<div className="px-6 max-w-7xl mx-auto mb-16 md:mb-20">
				<h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground text-balance">
					Recent Projects
				</h2>
				<p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl">
					A curated selection of work across branding, web development, content
					strategy, and public speaking.
				</p>
			</div>

			{loading && (
				<div className="px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="rounded-xl bg-card border border-border overflow-hidden"
						>
							<div className="aspect-[16/10] bg-muted animate-pulse" />
							<div className="p-5 space-y-3">
								<div className="h-4 w-20 bg-muted rounded-full animate-pulse" />
								<div className="h-6 w-40 bg-muted rounded animate-pulse" />
								<div className="h-4 w-32 bg-muted rounded animate-pulse" />
							</div>
						</div>
					))}
				</div>
			)}

			{!loading && projects.length === 0 && (
				<div className="px-6 max-w-7xl mx-auto text-muted-foreground">
					No projects available.
				</div>
			)}

			{!loading && projects.length > 0 && (
				<div className="px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
					{projects.map((project, i) => (
						<ProjectCard
							key={project.id}
							project={project}
							index={i}
							BASE_URL={BASE_URL}
						/>
					))}
				</div>
			)}
		</section>
	);
}

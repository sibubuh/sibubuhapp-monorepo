import { useRef, useState, useEffect, type MouseEvent } from "react";
import { motion } from "motion/react";
import { getProjects } from "../../../services/api";
import type { Project } from "../../../types/project";

function extractPlainText(content: unknown): string {
	if (!content) return "";
	if (typeof content === "string")
		return content.replace(/<[^>]*>/g, "").trim();
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

const categoryColors: Record<string, string> = {
	Branding: "bg-amber-100 text-amber-700",
	"Key Opinion Leader (KOL)": "bg-sky-100 text-sky-700",
	"Web Development": "bg-indigo-100 text-indigo-700",
	"Social Media Manager": "bg-rose-100 text-rose-700",
	"Public Speaking": "bg-violet-100 text-violet-700",
	Educator: "bg-emerald-100 text-emerald-700",
};

function TiltCard({
	project,
	index,
	BASE_URL,
}: {
	project: Project;
	index: number;
	BASE_URL: string;
}) {
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

		setRotateX(((y - centerY) / centerY) * -12);
		setRotateY(((x - centerX) / centerX) * 12);
		setGlareX((x / rect.width) * 100);
		setGlareY((y / rect.height) * 100);
	};

	const handleMouseLeave = () => {
		setRotateX(0);
		setRotateY(0);
		setIsHovered(false);
	};

	const descText = extractPlainText(project.description);

	return (
		<motion.div
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
		>
			<a href={`/projects/${project.slug}`} className="block">
				<div
					ref={cardRef}
					onMouseMove={handleMouseMove}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={handleMouseLeave}
					className="group relative rounded-[2rem] bg-white border border-slate-200/60 overflow-hidden will-change-transform"
					style={{
						transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
						transition: isHovered ? "none" : "transform 0.5s ease",
					}}
				>
					{/* Glare / spotlight follow mouse */}
					<div
						className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
						style={{
							opacity: isHovered ? 0.4 : 0,
							background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.8) 0%, transparent 60%)`,
						}}
					/>

					{/* Image */}
					<div className="aspect-[16/10] overflow-hidden bg-neutral-100">
						<img
							// @ts-ignore
							src={`${BASE_URL}${project.cover?.image?.url}`}
							alt={project.title}
							className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-100 group-hover:scale-105 transition-all duration-700"
						/>
					</div>

					{/* Content */}
					<div className="p-5 md:p-6">
						<div className="flex items-center justify-between mb-2">
							<span
								className={`inline-block px-2.5 py-0.5 text-[10px] md:text-xs font-medium rounded-full ${
									categoryColors[project.category] || "bg-neutral-100 text-neutral-600"
								}`}
							>
								{project.category}
							</span>
							<span className="text-xs text-slate-400 font-mono">
								{project.years || "2026"}
							</span>
						</div>

						<h3 className="text-lg md:text-xl font-bold uppercase tracking-tighter text-slate-900">
							{project.title}
						</h3>

						{descText && (
							<p className="mt-1.5 text-xs md:text-sm text-slate-500 leading-relaxed line-clamp-2">
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
		<section className="relative py-28 md:py-36 bg-white overflow-hidden">
			{/* Old paper texture */}
			<div
				className="absolute inset-0 opacity-[0.04] pointer-events-none"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
				}}
			/>

			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
				className="px-6 max-w-7xl mx-auto mb-16 md:mb-20"
			>
				<h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900">
					Recent Projects
				</h2>
				<p className="mt-4 text-lg text-slate-500 max-w-xl">
					A curated selection of work across branding, web development, content strategy, and public speaking.
				</p>
			</motion.div>

			{loading && (
				<div className="px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[1, 2, 3].map((i) => (
						<div key={i} className="rounded-[2rem] bg-neutral-100 animate-pulse overflow-hidden">
							<div className="aspect-[16/10] bg-neutral-200" />
							<div className="p-5 space-y-3">
								<div className="h-4 w-20 bg-neutral-200 rounded-full" />
								<div className="h-6 w-40 bg-neutral-200 rounded" />
								<div className="h-4 w-32 bg-neutral-200 rounded" />
							</div>
						</div>
					))}
				</div>
			)}

			{!loading && projects.length === 0 && (
				<div className="px-6 max-w-7xl mx-auto text-neutral-400">No projects available.</div>
			)}

			{!loading && projects.length > 0 && (
				<div className="px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
					{projects.map((project, i) => (
						<TiltCard
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

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Tag, Calendar } from "lucide-react";
import type { Project } from "../../../types/project";
import StrapiBlocks from "../sections/StrapiBlocks";
import InstagramReelsSection from "../sections/InstagramReelsSection";
import TiktokReelsSection from "../sections/TiktokReelsSection";

interface ProjectDetailProps {
	project: Project;
}

export default function ProjectDetail({ project }: ProjectDetailProps) {
	const coverImage = project.cover;
	const galleryImages = project.gallery || [];
	const BASE_URL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;

	return (
		<article>
			{/* 🔥 HERO COVER */}
			<div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">
				{coverImage && (
					<img
            //@ts-ignore
						src={`${BASE_URL}${coverImage.image.url}`}
						alt={project.title}
						className="absolute inset-0 w-full h-full object-cover scale-105"
					/>
				)}

				<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

				<div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-16">
					<motion.a
						href="/projects"
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6"
					>
						<ArrowLeft className="w-4 h-4" />
						<span className="text-sm">Back to Projects</span>
					</motion.a>

					<div className="flex flex-wrap items-center gap-3 mb-4">
						<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur text-white text-xs rounded-full uppercase tracking-widest">
							<Tag className="w-3 h-3" />
							{project.category}
						</span>

						{project.years && (
							<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur text-white text-xs rounded-full uppercase tracking-widest">
								<Calendar className="w-3 h-3" />
								{project.years}
							</span>
						)}
					</div>

					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="text-4xl md:text-6xl font-black text-white tracking-tight max-w-3xl"
					>
						{project.title}
					</motion.h1>
				</div>
			</div>

			{/* 🔥 CONTENT */}
			<div className="max-w-7xl mx-auto px-6 py-20">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="prose prose-lg max-w-none"
				>
					<StrapiBlocks data={project.description} />
				</motion.div>

				{/* 🔥 MODERN GALLERY */}
				{galleryImages.length > 0 && (
					<div className="mt-20">
						<h2 className="text-2xl font-bold text-slate-900 mb-10">
							Project Gallery
						</h2>

						<GallerySlider
							images={galleryImages}
							baseUrl={BASE_URL}
							title={project.title}
						/>
					</div>
				)}
        </div>
				{/* 🔥 REELS & TIKTOK SECTIONS */}
        <div className="w-full mx-auto px-0 py-0">
				{project.reelsandtiktok && project.reelsandtiktok.length > 0 && (
					<div className="mt-20">
						{project.reelsandtiktok.map((section) => (
							<div key={section.id}>
								{section.reels && section.reels.length > 0 && (
									<InstagramReelsSection
										reels={section.reels}
										title={"Instagram Reels"}
									/>
								)}

								{section.tiktok && section.tiktok.length > 0 && (
									<TiktokReelsSection
										videos={section.tiktok}
										title={"TikTok Videos"}
									/>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</article>
	);
}

function GallerySlider({
	images,
	baseUrl,
	title,
}: {
	images: any[];
	baseUrl: string;
	title: string;
}) {
	const [active, setActive] = useState(0);

	return (
		<div className="space-y-6">
			{/* 🔥 MAIN IMAGE */}
			<motion.div
				key={active}
				initial={{ opacity: 0.5, scale: 0.98 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.4 }}
				className="w-full aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100"
			>
				<img
					src={`${baseUrl}${images[active].url}`}
					alt={`${title} - ${active + 1}`}
					className="w-full h-full object-cover"
				/>
			</motion.div>

			{/* 🔥 THUMBNAILS */}
			<div className="flex gap-3 pb-2">
				{images.map((img, index) => (
					<button
						key={img.id || index}
						onClick={() => setActive(index)}
						className={`relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden transition-all ${
							active === index
								? "ring-2 ring-indigo-500 scale-105"
								: "opacity-70 hover:opacity-100"
						}`}
					>
						<img
							src={`${baseUrl}${img.url}`}
							alt=""
							className="w-full h-full object-cover"
						/>
					</button>
				))}
			</div>

			{/* 🔥 COUNTER */}
			<div className="text-xs text-slate-400 text-right">
				{active + 1} / {images.length}
			</div>
		</div>
	);
}

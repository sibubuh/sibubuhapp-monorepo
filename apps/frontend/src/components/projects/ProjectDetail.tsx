import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Tag, Calendar } from "lucide-react";
import type { Project } from "../../../types/project";
import StrapiBlocks from "../sections/StrapiBlocks";
import InstagramReelsSection from "../sections/InstagramReelsSection";
import TiktokReelsSection from "../sections/TiktokReelsSection";
import ProjectGallery from "./ProjectGallery";

interface ProjectDetailProps {
  project: Project;
}

export default function ProjectDetail({ project }: ProjectDetailProps) {
  const coverImage = project.cover;
  const galleryImages = project.gallery || [];
  const BASE_URL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;

  // ✅ prevent scroll jump + lazy load reels
  const [showReels, setShowReels] = useState(false);
  useEffect(() => {
    // lock scroll position on first render
    const x = window.scrollX;
    const y = window.scrollY;

    window.scrollTo(x, y);
    requestAnimationFrame(() => {
      window.scrollTo(x, y);
    });

    // delay reels render (IMPORTANT)
    const timer = setTimeout(() => {
      setShowReels(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <article>
      {/* HERO */}
      <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
        {coverImage && (
          <img
            //@ts-ignore
            src={`${BASE_URL}${coverImage.image.url}`}
            alt={project.title}
            className="absolute inset-0 h-full w-full scale-105 object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />

        <div className="relative z-10 flex h-full max-w-7xl flex-col justify-end px-6 pb-16 mx-auto">
          <motion.a
            href="/projects"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Projects</span>
          </motion.a>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-border bg-ink-foreground/5 px-3 py-1 text-[11px] font-medium text-ink-foreground">
              <Tag className="h-3 w-3" />
              {project.category}
            </span>

            {project.years && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-border bg-ink-foreground/5 px-3 py-1 text-[11px] font-medium text-ink-foreground">
                <Calendar className="h-3 w-3" />
                {project.years}
              </span>
            )}
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl font-serif text-4xl font-medium text-white md:text-6xl"
          >
            {project.title}
          </motion.h1>
        </div>
      </div>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="prose prose-lg max-w-none">
          <StrapiBlocks data={project.description} />
        </div>

        {/* GALLERY */}
        {galleryImages.length > 0 && (
          <div className="mt-16">
            <div className="mb-8 flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-2xl font-medium text-foreground">
                Project Gallery
              </h2>
              <span className="text-xs tracking-[0.12em] text-muted-foreground">
                {galleryImages.length} FOTO
              </span>
            </div>

            <ProjectGallery images={galleryImages} title={project.title} />
          </div>
        )}
      </div>

      {/* REELS (LAZY LOAD FIX) */}
      {showReels && project.reelsandtiktok?.length > 0 && (
        <div className="w-full">
          <div className="mt-20">
            {project.reelsandtiktok?.map((section) => (
              <div key={section.id}>
                {section.reels?.length > 0 && (
                  <InstagramReelsSection
                    reels={section.reels}
                    title="Instagram Reels"
                  />
                )}

                {section.tiktok?.length > 0 && (
                  <TiktokReelsSection
                    videos={section.tiktok}
                    title="TikTok Videos"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

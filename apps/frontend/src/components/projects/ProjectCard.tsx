import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "../../../types/project";

interface ProjectCardProps {
  project: Project;
  index?: number;
}

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  // @ts-ignore
  const coverImage = project.cover?.image?.url;
  const projectUrl = `/projects/${project.slug}`;
  const BASE_URL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.08 }}
    >
      <a href={projectUrl} className="block">
        <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-shadow duration-500 hover:shadow-card">
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            {coverImage ? (
              <img
                src={`${BASE_URL}${coverImage}`}
                alt={project.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="text-xs font-medium text-muted-foreground">
                  No Image
                </span>
              </div>
            )}

            {/* Category badge */}
            <div className="absolute left-3 top-3 z-20">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-medium text-foreground">
                {project.category}
              </span>
            </div>

            {/* Year badge */}
            {project.years && (
              <div className="absolute right-3 top-3 z-20">
                <span className="inline-flex items-center rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-medium text-foreground">
                  {project.years}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="mb-3 font-serif text-lg font-semibold leading-snug text-foreground transition-colors duration-300 group-hover:text-primary">
              {project.title}
            </h3>

            {/* Accent reveal on hover */}
            <div className="mb-3 h-px w-full overflow-hidden bg-border">
              <div className="h-full w-0 bg-primary transition-all duration-500 group-hover:w-full" />
            </div>

            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted-foreground">
                {new Date(project.createdAt).getFullYear() || "2026"}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-all duration-300 group-hover:text-primary">
                View Project
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  );
}

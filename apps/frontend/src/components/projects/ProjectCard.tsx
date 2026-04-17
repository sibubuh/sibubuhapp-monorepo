  import { motion } from "motion/react";
  import { ArrowUpRight, Tag } from "lucide-react";
  import type { Project } from "../../../types/project";

  interface ProjectCardProps {
    project: Project;
    index?: number;
  }

  export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
    const coverImage = project.cover.image.url;
    const projectUrl = `/projects/${project.slug}`;
    const BASE_URL = import.meta.env.VITE_PUBLIC_STRAPI_CMS_BASE_URL;

    return (
      <motion.a
        href={projectUrl}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group block bg-white rounded-2xl overflow-hidden hover:shadow-[0_8px_40px_rgba(99,102,241,0.15)] transition-all duration-500"
      >
        <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
          {coverImage ? (
            <img
              src={`${BASE_URL}${coverImage}`}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <span className="text-slate-400 text-xs tracking-widest uppercase">
                No Image
              </span>
            </div>
          )}

          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-sm text-indigo-600 text-[10px] font-semibold rounded-full uppercase tracking-widest shadow-sm">
              <Tag className="w-2.5 h-2.5" />
              {project.category}
            </span>
          </div>

          {project.years && (
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold rounded-full uppercase tracking-widest">
                {project.years}
              </span>
            </div>
          )}
        </div>

        <div className="p-6">
          <h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300 leading-snug mb-3">
            {project.title}
          </h3>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 group-hover:text-indigo-600 transition-all duration-300">
              View Project
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </span>
          </div>
        </div>
      </motion.a>
    );
  }

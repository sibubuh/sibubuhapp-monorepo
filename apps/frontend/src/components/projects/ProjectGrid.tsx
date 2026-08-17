import { useState } from "react";
import { motion } from "motion/react";
import type { Project, ProjectCategory } from "../../../types/project";
import ProjectCard from "./ProjectCard";
import { Container } from "../ui/Container";
import { Pill } from "../ui/Pill";
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
      <section className="relative h-[60vh] min-h-[440px] w-full overflow-hidden">
        <img
          src={bg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Calm legibility wash (no decorative grid) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        <Container className="relative z-10 flex h-full flex-col items-center justify-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="font-serif text-4xl font-medium text-balance text-white md:text-6xl lg:text-7xl"
          >
            <TextAnimation>My Projects</TextAnimation>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 md:text-xl"
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
              className="mx-auto flex h-8 w-5 justify-center rounded-full border border-white/30 pt-2"
            >
              <div className="h-2 w-1 rounded-full bg-white/60" />
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* ===== FILTER ===== */}
      <Container className="py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex flex-wrap justify-center gap-3"
        >
          <Pill active={activeCategory === "All"} onClick={() => setActiveCategory("All")}>
            All Projects
          </Pill>

          {CATEGORIES.map((category) => (
            <Pill
              key={category}
              active={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Pill>
          ))}
        </motion.div>
      </Container>

      {/* ===== GRID ===== */}
      <Container className="pb-28">
        {filteredProjects.length === 0 ? (
          <div className="py-20 text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-lg text-muted-foreground"
            >
              No projects found in this category.
            </motion.p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3"
          >
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </motion.div>
        )}
      </Container>
    </div>
  );
}

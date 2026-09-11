import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { getProject } from "../../../services/api";
import ProjectDetail from "../../components/projects/ProjectDetail";
import { SeoMeta } from "../../components/seo";

export const Route = createFileRoute("/projects/$slug")({
  // ✅ LOADER
  loader: async ({ params }) => {
    const slug = params?.slug || "";

    if (!slug) {
      return { project: null, slug };
    }

    try {
      const project = await getProject({
        locale: null,
        slug,
      });

      return { project, slug };
    } catch (error) {
      console.error("Error loading project:", error);
      return { project: null, slug };
    }
  },

  // ✅ 🔥 CRITICAL FIX: disable scroll restore
  scrollRestoration: false,

  component: ProjectPage,

  // ✅ 404 PAGE
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-8">
        <h1 className="mb-4 font-serif text-7xl font-medium text-foreground">404</h1>
        <p className="mb-8 text-xl text-muted-foreground">Project not found</p>
        <a
          href="/projects"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 font-medium text-background hover:text-ink-foreground transition-colors hover:bg-ink"
        >
          Back to Projects
        </a>
      </div>
    </div>
  ),
});

function ProjectPage() {
  const { project, slug } = Route.useLoaderData() as {
    project: any;
    slug: string;
  };

  // ✅ 🔥 FORCE SCROLL TOP (SECOND LAYER FIX)
  useEffect(() => {
    // instant jump to top (no animation)
    window.scrollTo(0, 0);

    // double ensure (handles iframe/layout shifts)
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, []);

  // ❌ NOT FOUND
  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="mb-4 font-serif text-7xl font-medium text-foreground">404</h1>
          <p className="text-xl text-muted-foreground mb-4">Project not found</p>
          <p className="mb-8 text-sm text-muted-foreground">Slug: {slug}</p>

          <a
            href="/projects"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 font-medium text-background hover:text-ink-foreground transition-colors hover:bg-ink"
          >
            Back to Projects
          </a>
        </div>
      </div>
    );
  }

  // ✅ PAGE
  return (
    <>
      <SeoMeta
        title={`${project.title} - Projects`}
        description="Project details and gallery"
      />

      <div className="w-full">
        <ProjectDetail project={project} />
      </div>
    </>
  );
}

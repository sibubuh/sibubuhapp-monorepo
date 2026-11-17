import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { getProject } from "../../../services/api";
import ProjectDetail from "../../components/projects/ProjectDetail";
import {
  JsonLd,
  buildBreadcrumbSchema,
  buildCreativeWorkSchema,
  buildGraph,
  buildSeoHead,
} from "../../components/seo";

/** Strapi rich text arrives as nested blocks; meta tags need flat prose. */
function toPlainText(content: unknown): string {
  if (!content) return "";
  if (typeof content === "string") return content.replace(/<[^>]*>/g, "").trim();
  if (Array.isArray(content)) return content.map(toPlainText).join(" ").trim();
  if (typeof content === "object" && "children" in content)
    return toPlainText((content as Record<string, unknown>).children);
  if (typeof content === "object" && "text" in content)
    return ((content as Record<string, unknown>).text as string) || "";
  return "";
}

function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

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

  head: ({ loaderData, params }) => {
    const project = (loaderData as { project?: any } | undefined)?.project;
    const description = truncate(toPlainText(project?.description));

    return buildSeoHead({
      path: `/projects/${params.slug}`,
      title: project ? `${project.title} - Projects` : "Project not found",
      description: description || "Project details and gallery",
      image: project?.cover?.image?.url ?? project?.cover?.[0]?.image?.url,
      type: "article",
      publishedTime: project?.createdAt,
      modifiedTime: project?.updatedAt,
      noIndex: !project,
    });
  },

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
      <JsonLd
        data={buildGraph([
          buildCreativeWorkSchema({
            title: project.title,
            slug: project.slug ?? slug,
            description: truncate(toPlainText(project.description), 300),
            category: project.category,
            image: project.cover?.image?.url ?? project.cover?.[0]?.image?.url,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
          }),
          buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Projects", path: "/projects" },
            { name: project.title, path: `/projects/${project.slug ?? slug}` },
          ]),
        ])}
      />

      <div className="w-full">
        <ProjectDetail project={project} />
      </div>
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { getProjects } from "../../../services/api";
import ProjectGrid from "../../components/projects/ProjectGrid";
import {
	JsonLd,
	buildBreadcrumbSchema,
	buildGraph,
	buildItemListSchema,
	buildSeoHead,
	buildWebPageSchema,
} from "../../components/seo";

export const Route = createFileRoute("/projects/")({
	//@ts-ignore
	loader: async () => {
		const { data: projects, total } = await getProjects({ locale: null });
		return { projects, total };
	},

	head: () =>
		buildSeoHead({
			path: "/projects",
			title: "Projects",
			description:
				"Explore my portfolio of projects including branding, web development, KOL collaborations, and more.",
			keywords:
				"Portfolio, Projects, Branding, Web Development, KOL, Social Media",
		}),

	component: ProjectsPage,
});

function ProjectsPage() {
	const { projects, total } = Route.useLoaderData();

	return (
		<>
			<JsonLd
				data={buildGraph([
					buildWebPageSchema({
						path: "/projects",
						name: "Projects",
						description:
							"Explore my portfolio of projects including branding, web development, KOL collaborations, and more.",
					}),
					buildBreadcrumbSchema([
						{ name: "Home", path: "/" },
						{ name: "Projects", path: "/projects" },
					]),
					// Naming each project here gives AI engines an explicit,
					// machine-readable index of what this site actually covers.
					buildItemListSchema(
						(projects ?? []).map((project: { title: string; slug: string }) => ({
							name: project.title,
							path: `/projects/${project.slug}`,
						})),
					),
				])}
			/>

			<ProjectGrid projects={projects} />
		</>
	);
}

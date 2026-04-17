import { createFileRoute } from "@tanstack/react-router";
import { getProjects } from "../../../services/api";
import ProjectGrid from "../../components/projects/ProjectGrid";
import { SeoMeta } from "../../components/seo";

export const Route = createFileRoute("/projects/")({
	//@ts-ignore
	loader: async () => {
		const { data: projects, total } = await getProjects({ locale: null });
		return { projects, total };
	},
	component: ProjectsPage,
});

function ProjectsPage() {
	const { projects, total } = Route.useLoaderData();
	return (
		<>
			<SeoMeta
				title="Projects - Sibubuh"
				description="Explore my portfolio of projects including branding, web development, KOL collaborations, and more."
				keywords="Portfolio, Projects, Branding, Web Development, KOL, Social Media"
			/>


					<ProjectGrid projects={projects} />

		</>
	);
}

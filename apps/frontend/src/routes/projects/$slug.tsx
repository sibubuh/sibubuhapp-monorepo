import { createFileRoute } from "@tanstack/react-router";
import { getProject } from "../../../services/api";
import ProjectDetail from "../../components/projects/ProjectDetail";
import { SeoMeta } from "../../components/seo";

export const Route = createFileRoute("/projects/$slug")({
	loader: async ({ params }) => {
		const slug = params?.slug || "";

		if (!slug) {
			return { project: null, slug };
		}

		try {
			const project = await getProject({
				locale: null,
				slug: slug,
			});

			return { project, slug };
		} catch (error) {
			console.error("Error loading project:", error);
			return { project: null, slug };
		}
	},
	component: ProjectPage,
	notFoundComponent: () => (
		<div className="min-h-screen flex items-center justify-center bg-neutral-50">
			<div className="text-center max-w-md mx-auto p-8">
				<h1 className="text-8xl font-black text-neutral-900 mb-4">404</h1>
				<p className="text-xl text-neutral-600 mb-8">Project not found</p>
				<a
					href="/projects"
					className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-indigo-600 transition-colors"
				>
					Back to Projects
				</a>
			</div>
		</div>
	),
});

function ProjectPage() {
	const { project, slug } = Route.useLoaderData();
	console.log(
		"[projects/$slug] Component render, project:",
		!!project,
		"slug:",
		slug,
	);


	if (!project) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-neutral-50">
				<div className="text-center max-w-md mx-auto p-8">
					<h1 className="text-8xl font-black text-neutral-900 mb-4">404</h1>
					<p className="text-xl text-neutral-600 mb-4">Project not found</p>
					<p className="text-sm text-neutral-400 mb-8">Slug: {slug}</p>
					<a
						href="/projects"
						className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-indigo-600 transition-colors"
					>
						Back to Projects
					</a>
				</div>
			</div>
		);
	}

	return (
		<>
			<SeoMeta
				title={`${project.title} - Projects`}
				description="Project details and gallery"
			/>
			<div className="py-12">
				<ProjectDetail project={project} />
			</div>
		</>
	);
}

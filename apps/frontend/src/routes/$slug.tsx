import { createFileRoute } from "@tanstack/react-router";
import { getPage } from "../../services/api";
import { DEFAULT_LANGUAGE_CODE } from "../../config/metadata";
import SectionRenderer from "../components/sections/SectionRenderer";
import { SeoMeta } from "../components/seo";

export const Route = createFileRoute("/$slug")({
  //@ts-ignore
	loader: async ({ params }) => {
		const slug = params.slug;
		const page = await getPage({
			locale: DEFAULT_LANGUAGE_CODE,
			slug: slug,
		})
		//return { page };
//	console.log(`Loaded page for slug: ${slug}`, page);
	return { page };
	},

	component: PageRoute,
	notFoundComponent: () => (
		<div className="min-h-[50vh] flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-6xl font-black text-neutral-900 mb-4">404</h1>
				<p className="text-xl text-neutral-600">Page not found</p>
			</div>
		</div>
	),
});

function PageRoute() {
	const { page } = Route.useLoaderData();

	if (!page) {
		return (
			<div className="min-h-[50vh] flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-6xl font-black text-neutral-900 mb-4">404</h1>
					<p className="text-xl text-neutral-600">Page not found</p>
				</div>
			</div>
		)
	}

	return (
		<>
			<SeoMeta
				title={page.seo?.metaTitle || page.title}
				description={page.seo?.metaDescription}
				keywords={page.seo?.keywords}
				image={page.seo?.metaImage?.url}
			/>
			<main>
				<SectionRenderer sections={page.sections} />
			</main>
		</>
	)
}

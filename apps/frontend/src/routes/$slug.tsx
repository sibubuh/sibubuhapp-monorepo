import { createFileRoute } from "@tanstack/react-router";
import { getPage } from "../../services/api";
import { DEFAULT_LANGUAGE_CODE } from "../../config/metadata";
import SectionRenderer from "../components/sections/SectionRenderer";
import {
	JsonLd,
	buildBreadcrumbSchema,
	buildGraph,
	buildSeoHead,
	buildWebPageSchema,
} from "../components/seo";

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

	head: ({ loaderData, params }) => {
		const page = (loaderData as { page?: any } | undefined)?.page;

		return buildSeoHead({
			path: `/${params.slug}`,
			title: page?.seo?.metaTitle || page?.title,
			description: page?.seo?.metaDescription,
			keywords: page?.seo?.keywords,
			image: page?.seo?.metaImage?.url,
			modifiedTime: page?.updatedAt,
			// A missing page renders the 404 body below; keep it out of the index.
			noIndex: !page,
		});
	},

	component: PageRoute,
	notFoundComponent: () => (
		<div className="min-h-[50vh] flex items-center justify-center">
			<div className="text-center">
				<h1 className="font-serif text-6xl font-medium tracking-tight text-foreground mb-4">404</h1>
				<p className="text-xl text-muted-foreground">Page not found</p>
			</div>
		</div>
	),
});

function PageRoute() {
  //@ts-ignore
	const { page } = Route.useLoaderData();

	if (!page) {
		return (
			<div className="min-h-[50vh] flex items-center justify-center">
				<div className="text-center">
					<h1 className="font-serif text-6xl font-medium tracking-tight text-foreground mb-4">404</h1>
					<p className="text-xl text-muted-foreground">Page not found</p>
				</div>
			</div>
		)
	}

	return (

		<>
			<JsonLd
				data={buildGraph([
					buildWebPageSchema({
						path: `/${page.slug}`,
						name: page.seo?.metaTitle || page.title,
						description: page.seo?.metaDescription,
						dateModified: page.updatedAt,
					}),
					buildBreadcrumbSchema([
						{ name: "Home", path: "/" },
						{ name: page.title, path: `/${page.slug}` },
					]),
				])}
			/>
			<main>

				<SectionRenderer sections={page.sections} />
			</main>
		</>
	)
}

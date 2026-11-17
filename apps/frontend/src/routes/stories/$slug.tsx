import { createFileRoute, notFound } from "@tanstack/react-router";
import { getStoryDetail } from "../../../services/api";
import {
	JsonLd,
	buildBlogPostingSchema,
	buildBreadcrumbSchema,
	buildGraph,
	buildSeoHead,
} from "../../components/seo";
import StoryDetail from "../../components/stories/StoryDetail";
import type { Story } from "../../../types/story";

export const Route = createFileRoute("/stories/$slug")({
	loader: async ({ params }) => {
		const path = `/stories/${params.slug}`;

		let story: Story | null = null;
		try {
			story = await getStoryDetail({ slug: params.slug });
		} catch (error) {
			// A transport failure is not a missing story, so it renders the
			// fallback instead of telling crawlers the URL is gone.
			console.error("Error loading story:", error);
			return { story: null, path };
		}

		// A real 404 status, not a soft one: crawlers treat a 200 that renders
		// "not found" as a thin page and keep the URL indexed.
		if (!story) throw notFound();

		return { story, path };
	},

	head: ({ loaderData }) => {
		const data = loaderData as
			| { story?: Story | null; path: string }
			| undefined;
		const story = data?.story;
		const path = data?.path ?? "/stories";

		return buildSeoHead({
			path,
			title: story?.seo?.metaTitle || story?.title || "Story not found",
			description:
				story?.seo?.metaDescription ||
				story?.excerpt ||
				"Story from the bubuh.id blog",
			keywords: story?.seo?.keywords || story?.labels?.join(", "),
			image: story?.seo?.metaImage?.url || story?.thumbnail?.url,
			type: "article",
			publishedTime: story?.publishedDate,
			modifiedTime: story?.updatedDate || story?.publishedDate,
			noIndex: !story,
		});
	},

	component: StoryPage,

	notFoundComponent: () => <StoryNotFound />,
});

function StoryNotFound() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="mx-auto max-w-md p-8 text-center">
				<h1 className="mb-4 font-serif text-7xl font-medium text-foreground">
					404
				</h1>
				<p className="mb-8 text-xl text-muted-foreground">Story not found</p>
				<a
					href="/stories"
					className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 font-medium text-background transition-colors hover:bg-ink hover:text-ink-foreground"
				>
					Back to Stories
				</a>
			</div>
		</div>
	);
}

function StoryPage() {
	const { story, path } = Route.useLoaderData() as {
		story: Story | null;
		path: string;
	};

	if (!story) return <StoryNotFound />;

	return (
		<>
			<JsonLd
				data={buildGraph([
					buildBlogPostingSchema({
						title: story.title,
						path,
						description: story.seo?.metaDescription || story.excerpt,
						image: story.seo?.metaImage?.url || story.thumbnail?.url,
						keywords: story.labels,
						publishedDate: story.publishedDate,
						updatedDate: story.updatedDate,
						wordCount: story.contentText
							? story.contentText.split(/\s+/).filter(Boolean).length
							: undefined,
					}),
					buildBreadcrumbSchema([
						{ name: "Home", path: "/" },
						{ name: "Stories", path: "/stories" },
						{ name: story.title, path },
					]),
				])}
			/>

			<StoryDetail story={story} />
		</>
	);
}

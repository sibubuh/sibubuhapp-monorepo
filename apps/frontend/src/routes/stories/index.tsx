import { Link, createFileRoute } from "@tanstack/react-router";
import { getStories } from "../../../services/api";
import {
	JsonLd,
	buildBreadcrumbSchema,
	buildGraph,
	buildItemListSchema,
	buildSeoHead,
	buildWebPageSchema,
} from "../../components/seo";
import StoryCard from "../../components/stories/StoryCard";
import type { Story } from "../../../types/story";

const PAGE_SIZE = 12;
const DESCRIPTION =
	"Catatan, liputan dan cerita dari bubuh.id — musik, pariwisata Sukabumi, komunitas, teknologi dan perjalanan sebagai blogger.";

type StoriesSearch = { page?: number; label?: string };

export const Route = createFileRoute("/stories/")({
	/**
	 * `page` stays optional on purpose. Returning a default here would make
	 * TanStack redirect `/stories` to `/stories?page=1`, which gives the
	 * landing page two URLs and a pointless hop for every visitor.
	 */
	validateSearch: (search: Record<string, unknown>): StoriesSearch => {
		const page = Number(search.page);
		const valid = Number.isFinite(page) && page > 1 ? Math.floor(page) : undefined;
		return {
			...(valid ? { page: valid } : {}),
			...(typeof search.label === "string" && search.label
				? { label: search.label }
				: {}),
		};
	},

	// Without this the loader keeps the first page's data when ?page changes.
	loaderDeps: ({ search }) => ({ page: search.page ?? 1, label: search.label }),

	loader: async ({ deps }) => {
		try {
			const result = await getStories({
				limit: PAGE_SIZE,
				page: deps.page,
				label: deps.label,
			});

			return {
				stories: result?.data ?? [],
				pageCount: result?.meta?.pagination?.pageCount ?? 1,
				total: result?.meta?.pagination?.total ?? 0,
				page: deps.page,
				label: deps.label,
			};
		} catch (error) {
			console.error("Error loading stories:", error);
			return {
				stories: [],
				pageCount: 1,
				total: 0,
				page: deps.page,
				label: deps.label,
			};
		}
	},

	head: ({ loaderData }) => {
		const page = (loaderData as { page?: number } | undefined)?.page ?? 1;
		return buildSeoHead({
			// Self-referencing canonical, including ?page: pointing every page of
			// a series at page 1 tells Google the deeper pages are duplicates and
			// the stories only listed there stop being discoverable.
			path: page > 1 ? `/stories?page=${page}` : "/stories",
			title: page > 1 ? `Stories — Page ${page}` : "Stories",
			description: DESCRIPTION,
			keywords: "Blog, Stories, bubuh.id, Sukabumi, Musik, Pariwisata",
		});
	},

	component: StoriesPage,
});

function StoriesPage() {
	const { stories, pageCount, total, page, label } = Route.useLoaderData() as {
		stories: Story[];
		pageCount: number;
		total: number;
		page: number;
		label?: string;
	};

	return (
		<>
			<JsonLd
				data={buildGraph([
					buildWebPageSchema({
						path: "/stories",
						name: "Stories",
						description: DESCRIPTION,
					}),
					buildBreadcrumbSchema([
						{ name: "Home", path: "/" },
						{ name: "Stories", path: "/stories" },
					]),
					buildItemListSchema(
						stories.map((story) => ({
							name: story.title,
							path: `/stories/${story.slug}`,
						})),
					),
				])}
			/>

			<section className="bg-background px-6 pb-24 pt-24 md:pt-32">
				<div className="mx-auto max-w-7xl">
					<header className="mb-12 max-w-2xl">
						<h1 className="font-serif text-4xl font-medium leading-tight text-foreground md:text-5xl">
							Stories
						</h1>
						<p className="mt-4 text-lg leading-relaxed text-muted-foreground">
							{DESCRIPTION}
						</p>
						<p className="mt-4 text-sm text-muted-foreground">
							{total} cerita{label ? ` · ${label}` : ""}
						</p>
						{label && (
							<Link
								to="/stories"
								search={{}}
								className="mt-2 inline-block text-sm text-muted-foreground underline underline-offset-2"
							>
								Hapus filter
							</Link>
						)}
					</header>

					{stories.length === 0 ? (
						<p className="text-muted-foreground">Belum ada cerita di sini.</p>
					) : (
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{stories.map((story, index) => (
								<StoryCard key={story.id} story={story} index={index} />
							))}
						</div>
					)}

					{pageCount > 1 && (
						<nav
							className="mt-14 flex items-center justify-between gap-4"
							aria-label="Pagination"
						>
							{page > 1 ? (
								<Link
									to="/stories"
									search={{ ...(page > 2 ? { page: page - 1 } : {}), label }}
									className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
								>
									← Sebelumnya
								</Link>
							) : (
								<span />
							)}

							<span className="text-sm text-muted-foreground">
								Halaman {page} dari {pageCount}
							</span>

							{page < pageCount ? (
								<Link
									to="/stories"
									search={{ page: page + 1, label }}
									className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
								>
									Selanjutnya →
								</Link>
							) : (
								<span />
							)}
						</nav>
					)}
				</div>
			</section>
		</>
	);
}

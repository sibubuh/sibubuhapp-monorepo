import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowUpRight, Search } from "lucide-react";
import { type ReactNode, useState } from "react";
import { searchContent } from "../../services/api";
import type { SearchResults } from "../../services/api";
import ProjectCard from "../components/projects/ProjectCard";
import { buildSeoHead } from "../components/seo";
import StoryCard from "../components/stories/StoryCard";

const PER_TYPE = 10;
const MAX_QUERY_LENGTH = 100;

const EMPTY: SearchResults = { stories: [], projects: [], pages: [], total: 0 };

type SearchSearch = { q?: string };

export const Route = createFileRoute("/search")({
	validateSearch: (search: Record<string, unknown>): SearchSearch => {
		const q =
			typeof search.q === "string"
				? search.q.trim().slice(0, MAX_QUERY_LENGTH)
				: "";
		return q ? { q } : {};
	},

	loaderDeps: ({ search }) => ({ q: search.q }),

	loader: async ({ deps }) => {
		if (!deps.q) return { ...EMPTY, q: "" };

		try {
			const results = await searchContent({ q: deps.q, limit: PER_TYPE });
			return { ...results, q: deps.q };
		} catch (error) {
			console.error("Error searching:", error);
			return { ...EMPTY, q: deps.q };
		}
	},

	// Result pages are thin, duplicate-prone content — keep them out of the index.
	head: () =>
		buildSeoHead({
			path: "/search",
			title: "Pencarian",
			description:
				"Cari cerita, project dan halaman di bubuh.id dalam satu tempat.",
			noIndex: true,
		}),

	component: SearchPage,
});

function SearchPage() {
	const { stories, projects, pages, total, q } = Route.useLoaderData() as
		& SearchResults
		& { q: string };
	const navigate = useNavigate();
	const [draft, setDraft] = useState(q);

	return (
		<section className="bg-background px-6 pb-24 pt-24 md:pt-32">
			<div className="mx-auto max-w-7xl">
				<header className="mb-12 max-w-2xl">
					<h1 className="font-serif text-4xl font-medium leading-tight text-foreground md:text-5xl">
						Pencarian
					</h1>

					<form
						className="mt-6 flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3"
						onSubmit={(event) => {
							event.preventDefault();
							const next = draft.trim();
							navigate({ to: "/search", search: next ? { q: next } : {} });
						}}
					>
						<Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
						<input
							type="search"
							name="q"
							value={draft}
							onChange={(event) => setDraft(event.target.value)}
							maxLength={MAX_QUERY_LENGTH}
							// biome-ignore lint/a11y/noAutofocus: the page exists only to be typed into
							autoFocus
							placeholder="Cari cerita, project, atau halaman…"
							aria-label="Kata kunci pencarian"
							className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
						/>
						<button
							type="submit"
							className="shrink-0 rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-colors hover:bg-ink hover:text-ink-foreground"
						>
							Cari
						</button>
					</form>

					{q && (
						<p className="mt-4 text-sm text-muted-foreground">
							{total} hasil untuk “{q}”
						</p>
					)}
				</header>

				{q && total === 0 && (
					<p className="text-muted-foreground">
						Tidak ada hasil untuk “{q}”. Coba kata kunci lain.
					</p>
				)}

				{stories.length > 0 && (
					<ResultGroup title="Stories" count={stories.length}>
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{stories.map((story, index) => (
								<StoryCard key={story.id} story={story} index={index} />
							))}
						</div>
					</ResultGroup>
				)}

				{projects.length > 0 && (
					<ResultGroup title="Projects" count={projects.length}>
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{projects.map((project, index) => (
								<ProjectCard key={project.id} project={project} index={index} />
							))}
						</div>
					</ResultGroup>
				)}

				{pages.length > 0 && (
					<ResultGroup title="Halaman" count={pages.length}>
						<ul className="divide-y divide-border border-y border-border">
							{pages.map((page) => (
								<li key={page.id}>
									<Link
										to="/$slug"
										params={{ slug: page.slug }}
										className="group flex items-center justify-between gap-4 py-4 text-foreground"
									>
										<span className="font-medium">{page.title}</span>
										<ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
									</Link>
								</li>
							))}
						</ul>
					</ResultGroup>
				)}
			</div>
		</section>
	);
}

function ResultGroup({
	title,
	count,
	children,
}: {
	title: string;
	count: number;
	children: ReactNode;
}) {
	return (
		<div className="mb-16">
			<h2 className="mb-6 font-serif text-2xl font-medium text-foreground">
				{title}{" "}
				<span className="font-sans text-sm font-normal text-muted-foreground">
					({count})
				</span>
			</h2>
			{children}
		</div>
	);
}

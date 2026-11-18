import { createFileRoute } from "@tanstack/react-router";
import {
	getClient,
	getHomeSlider,
	getProjects,
	getSocialMedia,
	getStories,
	getWebIntro,
} from "../../services/api";
import HeroSlider, { HERO_SIZES } from "../../ui/HeroSlider";
import WebIntro from "../components/ui/WebIntro";
import PortfolioSlider from "../components/ui/PortfolioSlider";
import SocialMediaSection from "../components/sections/SocialMediaSection";
import ContactCTA from "../components/ui/ContactCTA";
import RecentStoriesSection from "../components/sections/RecentStoriesSection";
import {
	JsonLd,
	buildGraph,
	buildPersonSchema,
	buildSeoHead,
	buildWebPageSchema,
	buildWebSiteSchema,
} from "../components/seo";
import ClientsParallax from "#/components/ui/ClientSection";
import { STRAPI_CMS_BASE_URL } from "../../config/strapi";
import { strapiImage } from "../../libs/strapi-image";
import type { HomeSlider } from "../../types/home-slider";

const STORY_LIMIT = 6;
const PROJECT_LIMIT = 6;

function extractStrapiText(content: unknown): string {
	if (!content) return "";
	if (typeof content === "string")
		return content.replace(/<[^>]*>/g, "").trim();
	if (Array.isArray(content)) {
		return content.map(extractStrapiText).join(" ");
	}
	if (typeof content === "object" && "children" in content) {
		return extractStrapiText((content as Record<string, unknown>).children);
	}
	if (typeof content === "object" && "text" in content) {
		return ((content as Record<string, unknown>).text as string) || "";
	}
	return "";
}

/** Flattens the home-slider single type into exactly what HeroSlider renders. */
function toSlides(homeSlider: HomeSlider | null) {
	return (
		homeSlider?.slider?.map((slide) => {
			const image = strapiImage(slide.image);
			return {
				id: slide.id,
				title: slide.title,
				sub: extractStrapiText(slide.content),
				img: image?.src || slide.image?.url || "",
				srcSet: image?.srcSet,
				width: image?.width,
				height: image?.height,
			};
		}) ?? []
	);
}

export const Route = createFileRoute("/")({
	/**
	 * Everything the homepage shows is fetched here rather than in each
	 * section's useEffect, so it lands in the server-rendered HTML. AI crawlers
	 * and Googlebot's first pass read that HTML; data arriving after hydration
	 * is invisible to them.
	 *
	 * Each source settles independently — one unreachable endpoint degrades its
	 * own section instead of blanking the page.
	 */
	loader: async () => {
		const [homeSlider, webIntro, projects, client, socialMedia, stories] =
			await Promise.all([
				getHomeSlider({ locale: null }).catch(() => null),
				getWebIntro({ locale: null }).catch(() => null),
				getProjects({ locale: null, limit: PROJECT_LIMIT }).catch(() => ({
					data: [],
					total: 0,
				})),
				getClient({ locale: null }).catch(() => null),
				getSocialMedia({ locale: null }).catch(() => null),
				getStories({ limit: STORY_LIMIT, page: 1 }).catch(() => null),
			]);

		return {
			// Mapped here, not in the component: returning the raw single type
			// serialises every slide's full media object — name, hash, mime,
			// provider, timestamps — into the hydration script for nothing.
			slides: toSlides(homeSlider),
			webIntro,
			projects: projects?.data ?? [],
			client,
			socialMedia,
			stories: stories?.data ?? null,
		};
	},

	head: ({ loaderData }) => {
		const seo = buildSeoHead({
			path: "/",
			title: "Sibubuh Playground - Find Everything is about me here",
			description:
				"I was built to showcase my work and share my thoughts on various topics.",
			keywords:
				"Sibubuh, Playground, Portfolio, Blog, Contact, KOL, Influencer, Digital Agency, Web Development, Mobile Apps, UI/UX Design",
		});

		// The hero image is the LCP element and lives on another origin, so the
		// browser only discovers it after the HTML is parsed. Preconnect opens the
		// connection early; the preload starts the download before React runs.
		const hero = loaderData?.slides?.[0];

		return {
			...seo,
			links: [
				...seo.links,
				{ rel: "preconnect", href: STRAPI_CMS_BASE_URL },
				...(hero?.img
					? [
							{
								rel: "preload",
								as: "image",
								href: hero.img,
								imagesrcset: hero.srcSet,
								imagesizes: HERO_SIZES,
								fetchpriority: "high",
							},
						]
					: []),
			],
		};
	},

	component: Index,
});

function Index() {
	const { slides, webIntro, projects, client, socialMedia, stories } =
		Route.useLoaderData();

	// Verified profile URLs from the CMS become sameAs links, which is what
	// ties this site to the same person elsewhere in the Knowledge Graph.
	const sameAs = (socialMedia?.social ?? [])
		.map((item) => item.link)
		.filter((link): link is string => Boolean(link?.startsWith("http")));

	// The homepage has no date of its own, so the newest project stands in as
	// its freshness signal — Google's G-DATES check wants one and the value is
	// true: that is genuinely when this page's content last changed.
	const dateModified = projects
		.map((project) => project.updatedAt || project.createdAt)
		.filter(Boolean)
		.sort()
		.at(-1);

	return (
		<>
			<JsonLd
				data={buildGraph([
					buildWebSiteSchema(),
					buildPersonSchema(sameAs),
					buildWebPageSchema({
						path: "/",
						name: "Sibubuh Playground",
						description:
							"I was built to showcase my work and share my thoughts on various topics.",
						dateModified,
					}),
				])}
			/>
			<HeroSlider slides={slides} />
			<WebIntro initialData={webIntro} />
			<RecentStoriesSection
				title="My Story"
				subtitle="Story about me, my work, and my journey in the digital world."
				showViewAll={true}
				stories={stories}
			/>
			<PortfolioSlider initialProjects={projects} />
			<ClientsParallax initialClient={client} />
			<SocialMediaSection initialData={socialMedia} />

			<ContactCTA />
		</>
	);
}

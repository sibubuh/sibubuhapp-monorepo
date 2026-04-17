import { createFileRoute } from "@tanstack/react-router";
import { getHomeSlider } from "../../services/api";
import HeroSlider from "../../ui/HeroSlider";
import WebIntro from "../components/ui/WebIntro";
import PortfolioSlider from "../components/ui/PortfolioSlider";
import TeamSection from "../components/ui/TeamSection";
import ContactCTA from "../components/ui/ContactCTA";
import RecentBlogsSection from "../components/sections/RecentBlogsSection";
import { SeoMeta } from "../components/seo";

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

export const Route = createFileRoute("/")({
	loader: async () => {
		const homeSlider = await getHomeSlider({ locale: null });
		return { homeSlider };
	},
	component: Index,
});

function Index() {
	const { homeSlider } = Route.useLoaderData();

	const slides =
		homeSlider?.slider?.map((s) => ({
			id: s.id,
			title: s.title,
			sub: extractStrapiText(s.content),
			img: s.image?.url || "",
		})) || [];

	return (
		<>
			<SeoMeta
				title="Sibubuh Playground - Find Everything is about me here"
				description="I was built to showcase my work and share my thoughts on various topics."
				keywords="Sibubuh, Playground, Portfolio, Blog, Contact, KOL, Influencer, Digital Agency, Web Development, Mobile Apps, UI/UX Design"
			/>
			<HeroSlider slides={slides} />
			<WebIntro />
			<RecentBlogsSection
				title="My Story"
				subtitle="Story about me, my work, and my journey in the digital world."
				limit={6}
				showViewAll={true}
			/>
			<PortfolioSlider />
			<TeamSection />
			<ContactCTA />
		</>
	);
}

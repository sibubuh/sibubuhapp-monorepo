import { createFileRoute } from "@tanstack/react-router";
import HeroSlider from "../components/ui/HeroSlider";
import WebIntro from "../components/ui/WebIntro";
import PortfolioSlider from "../components/ui/PortfolioSlider";
import TeamSection from "../components/ui/TeamSection";
import ContactCTA from "../components/ui/ContactCTA";
import RecentBlogsSection from "../components/sections/RecentBlogsSection";
import { SeoMeta } from "../components/seo";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	return (
		<>
			<SeoMeta
				title="Sibubuh Playground - Find Everything is about me here"
				description="I was built to showcase my work and share my thoughts on various topics."
				keywords="Sibubuh, Playground, Portfolio, Blog, Contact, KOL, Influencer, Digital Agency, Web Development, Mobile Apps, UI/UX Design"
			/>
			<HeroSlider />
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

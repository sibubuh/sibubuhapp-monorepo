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
				title="Digital Innovation Agency"
				description="We craft high-performance digital products for ambitious brands."
				keywords="digital agency, web development, design"
			/>
			<HeroSlider />
			<WebIntro />
      <RecentBlogsSection
				title="My Blog Post"
				subtitle="Blog post about travel, lifestyle, and more"
				limit={6}
				showViewAll={true}
			/>
			<PortfolioSlider />
			<TeamSection />
			<ContactCTA />
		</>
	);
}

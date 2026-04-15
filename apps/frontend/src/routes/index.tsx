import { createFileRoute } from '@tanstack/react-router';
import HeroSlider from '../components/ui/HeroSlider';
import WebIntro from '../components/ui/WebIntro';
import PortfolioSlider from '../components/ui/PortfolioSlider';
import TeamSection from '../components/ui/TeamSection';
import ContactCTA from '../components/ui/ContactCTA';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <>
      <HeroSlider />
      <WebIntro />
      <PortfolioSlider />
      <TeamSection />
      <ContactCTA />
    </>
  );
}

import { createFileRoute } from '@tanstack/react-router';
import HeroSlider from '../components/home/HeroSlider';
import WebIntro from '../components/home/WebIntro';
import PortfolioSlider from '../components/home/PortfolioSlider';
import TeamSection from '../components/home/TeamSection';
import ContactCTA from '../components/home/ContactCTA';

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

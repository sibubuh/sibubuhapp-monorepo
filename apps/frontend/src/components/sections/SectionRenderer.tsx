import type { SectionItem } from "../../../types/page";
import HeroSection from "./HeroSection";
import HeroHomeSection from "./HeroHomeSection";
import HeroPageSection from "./HeroPageSection";
import HeroAnchorSection from "./HeroAnchorSection";
import PartnersSection from "./PartnersSection";
import CompanyIntroSection from "./CompanyIntroSection";
import VisionMissionSection from "./VisionMissionSection";
import AboutUsSection from "./AboutUsSection";
import ContactUsSection from "./ContactUsSection";
import RichTextSection from "./RichTextSection";
import QuoteSection from "./QuoteSection";
import SitemapSection from "./SitemapSection";
import ImageSection from "./ImageSection";
import ImageWithContentSection from "./ImageWithContentSection";
import LottieSection from "./LottieSection";
import TextHeadlineSection from "./TextHeadlineSection";
import SubheadlineSection from "./SubheadlineSection";
import InformationSupportSection from "./InformationSupportSection";
import RawHtmlSection from "./RawHtmlSection";
import WhistleblowingSection from "./WhistleblowingSection";
import MultipleDownloadSection from "./MultipleDownloadSection";
import GroupedDownloadSection from "./GroupedDownloadSection";

const sectionComponents: Record<string, React.ComponentType<any>> = {
	"sections.hero": HeroSection,
	"sections.hero-home": HeroHomeSection,
	"sections.hero-page": HeroPageSection,
	"sections.hero-anchor": HeroAnchorSection,
	"sections.partners": PartnersSection,
	"sections.company-intro": CompanyIntroSection,
	"sections.vision-mission": VisionMissionSection,
	"sections.about-us": AboutUsSection,
	"sections.contact-us": ContactUsSection,
	"sections.rich-text-section": RichTextSection,
	"sections.quote": QuoteSection,
	"sections.sitemap": SitemapSection,
	"sections.image": ImageSection,
	"sections.image-with-content": ImageWithContentSection,
	"sections.lottie": LottieSection,
	"sections.text-headline": TextHeadlineSection,
	"sections.subheadline": SubheadlineSection,
	"sections.information-support": InformationSupportSection,
	"sections.raw-html": RawHtmlSection,
	"sections.whistleblowing": WhistleblowingSection,
	"sections.multiple-download-item": MultipleDownloadSection,
	"sections.grouped-download-item": GroupedDownloadSection,
};

interface SectionRendererProps {
	sections: SectionItem[];
}

export default function SectionRenderer({ sections }: SectionRendererProps) {
	return (
		<div className="flex flex-col">
			{sections.map((section, index) => {
				const Component = sectionComponents[section.__component];
				if (!Component) {
					return (
						<div key={index} className="p-8 text-center text-neutral-400">
							Unknown section: {section.__component}
						</div>
					);
				}
				return <Component key={index} {...section} />;
			})}
		</div>
	);
}

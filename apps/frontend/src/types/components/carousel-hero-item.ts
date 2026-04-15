import type { ImageType } from "../image";
import type { CarouselCtaType } from "./carousel-cta";

export type CarouselHeroItemType = {
	title: string;
	image: ImageType;
	link: CarouselCtaType;
	content_title: string;
};

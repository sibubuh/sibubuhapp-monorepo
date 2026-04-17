import { ImageType } from "./image";

export interface HomeSliderSlide {
	id: number;
	title: string;
	content: string;
	image: ImageType;
}

export interface HomeSlider {
	id: number;
	slider: HomeSliderSlide[];
}

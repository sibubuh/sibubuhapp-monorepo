import type { ImageType } from "../image";
import type { AnchorType } from "../components";

export type CompanyIntroSection = {
	title: string;
	secondary_title?: string;
	description: string;
	link?: AnchorType;
	image: ImageType;
};

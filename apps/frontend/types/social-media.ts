import { ImageType } from "./image";

export interface SocialMediaItem {
	id: number;
	name: string;
	link: string;
	thumbnail: ImageType;
	description: unknown;
}

export interface SocialMedia {
	id: number;
	title: string;
	social: SocialMediaItem[];
}

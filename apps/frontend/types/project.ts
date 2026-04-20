import { ImageType } from "./image";

export type ProjectCategory =
	| "Branding"
	| "Key Opinion Leader (KOL)"
	| "Web Development"
	| "Social Media Manager"
	| "Public Speaking"
	| "Educator";

export type ProjectCoverImage = {
	id: number;
	image: ImageType;
};

export type InstagramReelsGallery = {
	__component?: "sections.instagram-reels-gallery";
	id: number;
	url_id: string;
	author: string;
	avatar: ImageType;
	caption: string;
	title?: string;
};

export type TikTokGallery = {
	__component?: "sections.tiktok-gallery";
	id: number;
	id_titkok: string;
	author: string;
	handle: string;
	caption: string;
	avatar: ImageType;
	tag: string;
};

export type ReelsTikTok = {
	__component: "sections.reels-tiktok";
	id: number;
	title: string;
	reels: InstagramReelsGallery[];
	tiktok: TikTokGallery[];
};

export type Project = {
	id: number;
	title: string;
	slug: string;
	description: unknown;
	category: ProjectCategory;
	cover: ProjectCoverImage[];
	years: string;
	gallery: ImageType[];
	reelsandtiktok?: ReelsTikTok[];
	createdAt: string;
	updatedAt: string;
};

export type ProjectsData = {
	data: Project[];
	total: number;
	page: number;
	pageSize: number;
};

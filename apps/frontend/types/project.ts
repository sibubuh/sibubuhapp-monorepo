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

export type Project = {
	id: number;
	title: string;
	slug: string;
	description: unknown;
	category: ProjectCategory;
	cover: ProjectCoverImage[];
	years: string;
	gallery: ImageType[];
	createdAt: string;
	updatedAt: string;
};

export type ProjectsData = {
	data: Project[];
	total: number;
	page: number;
	pageSize: number;
};

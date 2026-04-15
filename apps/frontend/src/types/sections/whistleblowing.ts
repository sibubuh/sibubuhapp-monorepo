import type { ImageType } from "../image";
import type { BlocksContent } from "../blocks";

export type TextImageType = {
	text: string;
	image: ImageType;
};

export type WhistleblowingSection = {
	title: string;
	description1: BlocksContent;
	description2: BlocksContent;
	image: ImageType;
	contact_title: string;
	blocks: TextImageType[];
};

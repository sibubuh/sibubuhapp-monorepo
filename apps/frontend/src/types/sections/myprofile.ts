import type { ImageType } from "../image";
import type { BlocksContent } from "../blocks";

export type TitleAndContentAndImage = {
	title: string;
	content: BlocksContent;
	image: ImageType;
};

export type MyprofileSection = {
	__component: "sections.myprofile";
	title: string;
	aboutme: TitleAndContentAndImage[];
};

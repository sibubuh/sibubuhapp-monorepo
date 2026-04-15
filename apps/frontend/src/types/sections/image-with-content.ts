import type { ImageType } from "../image";
import type { BlocksContent } from "../blocks";

export type ImageWithContentSection = {
	image: ImageType;
	content: BlocksContent;
};

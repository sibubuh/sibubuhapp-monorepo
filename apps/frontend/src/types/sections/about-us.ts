import type { ImageType } from "../image";
import type { BlocksContent } from "../blocks";

export type AboutUsSection = {
	title: string;
	content: BlocksContent;
	banner: ImageType;
	maps_lottie?: ImageType;
	content2?: BlocksContent;
};

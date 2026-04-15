import { AnchorType } from "./index";

export type NavigationMenu = {
	title: AnchorType;
	sub_menus?: AnchorType[];
};

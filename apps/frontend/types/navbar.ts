import { ImageType, NavigationMenu } from "./index";

export type Navbar = {
	id: number;
	attributes: {
		logo_black: ImageType;
		logo_white: ImageType;
		menu: NavigationMenu[];
	};
	locale: string;
};

export type NavbarResponse = {
	data: Navbar | null;
};

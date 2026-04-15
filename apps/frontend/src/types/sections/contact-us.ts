import type { TextFieldType, AnchorAndImageType } from "../components";

export type ContactUsSection = {
	maps_url: string;
	contact_title: string;
	form_title: string;
	submit_label: string;
	submitting_label: string;
	first_name: TextFieldType;
	last_name: TextFieldType;
	phone_number: TextFieldType;
	email_address: TextFieldType;
	message: TextFieldType;
	items: AnchorAndImageType[];
};

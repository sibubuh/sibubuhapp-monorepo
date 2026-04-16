export interface BubuhBlogPost {
	id: string;
	title: string;
	link: string;
	published: string;
	updated?: string;
	categories: string[];
	summary: string;
	thumbnail?: {
		url: string;
		width: number;
		height: number;
	};
	thumbnailOriginal?: string;
	author?: string;
	commentCount?: number;
	location?: {
		name: string;
		lat: number;
		lng: number;
	};
}

export interface BubuhBlogFeed {
	posts: BubuhBlogPost[];
	totalResults: number;
	startIndex: number;
	itemsPerPage: number;
}

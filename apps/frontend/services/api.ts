import QueryString from "qs";

import { DEFAULT_LANGUAGE_CODE } from "../config/metadata";
import {
	DataPagination,
	Filters,
	Footer,
	HomeSlider,
	Navbar,
	Page,
	PaginationParams,
	Post,
	Project,
	ShareButton,
	SocialMedia,
	ImageType,
} from "../types";

import fetchWithAuth from "./client";

export async function getPage({
	locale,
	slug,
}: {
	locale: string;
	slug: string;
}): Promise<Page> {
	const result = await getDataWithLocalization({
		endpoint: "/api/pages",
		locale: locale,
		filters: {
			slug: {
				$eq: slug,
			},
		},
		multipleData: false,
		populate: [
			"localizations",
			"seo",
			"seo.metaImage",
			"sections",
			"sections.image",
			"sections.link",
			"sections.partners",
			"sections.partners.image",
			"sections.partners.link",
			"sections.items",
			"sections.items.link",
			"sections.heropage",
			"sections.heropage.image",
			"sections.heropage.content",
			"sections.items.icon",
			"sections.see_more",
			"sections.data",
			"sections.header",
			"sections.document",
			"sections.mission",
			"sections.items.image",
			"sections.blocks.block_detail",
			"sections.blocks.image",
			"sections.blocks.block_detail.icon",
			"sections.sitemap_list",
			"sections.sitemap_list.items",
			"sections.milestones.milestones",
			"sections.highlights_title",
			"sections.address",
			"sections.phones",
			"sections.email",
			"sections.website",
			"sections.milestones",
			"sections.milestones.image",
			"sections.companies",
			"sections.companies.image",
			"sections.companies.detail",
			"sections.companies.address",
			"sections.companies.contacts.icon",
			"sections.banner",
			"sections.maps_lottie",
			"sections.first_name",
			"sections.last_name",
			"sections.email_address",
			"sections.phone_number",
			"sections.message",
			"sections.items.items.image",
			"sections.gcg.items.image",
			"sections.items.image",
			"sections.post",
			"sections.post.thumbnail",
			"sections.highlight",
			"sections.highlight.thumbnail",
			"sections.lottie",
			"sections.items.file",
			"sections.groups.items",
			"sections.groups.items.file",
			"sections.rups_item",
			"sections.rups_item.thumbnail",
			"sections.rups_item.file",
			"sections.shareholder_block",
			"sections.shareholder_block.data",
			"sections.items.contacts.icon",
			// TODO: nested populated sections
		],
	});

	return result;
}

export async function getHeader({
	locale,
}: {
	locale: string | null;
}): Promise<Navbar | null> {
	return await getDataWithLocalization({
		locale: locale,
		populate: [
			"localizations",
			"attributes",
			"attributes.logo_white",
			"attributes.logo_black",
			"attributes.menu",
			"attributes.menu.title",
			"attributes.menu.sub_menus",
		],
		filters: {},
		endpoint: "/api/navbar",
		singleType: true,
	});
}

export async function getFooter({
	locale,
}: {
	locale: string | null;
}): Promise<Footer | null> {
	return await getDataWithLocalization({
		endpoint: "/api/footer",
		populate: [
			"localizations",
			"attributes",
			"attributes.links",
			"attributes.address",
			"attributes.contacts",
			"attributes.contacts.anchor",
			"attributes.logo",
		],
		filters: {},
		singleType: true,
		locale: locale,
	});
}

export async function getShareButton({
	locale,
}: {
	locale: string | null;
}): Promise<ShareButton | null> {
	const res = (await getDataWithLocalization({
		endpoint: "/api/share-button",
		populate: ["localizations", "sharer_group"],
		filters: {},
		singleType: true,
		locale: locale,
	})) as ShareButton | null;

	if (res && res.sharer_group.length) {
		const group = res.sharer_group.filter((e) => !!e.is_shown);
		res.sharer_group = group;
	}

	return res;
}

export async function getNews({
	locale,
	limit,
	page,
	year,
}: {
	locale: string;
	limit: number;
	page: number;
	year?: number;
}): Promise<DataPagination<Post>> {
	const filter =
		year !== undefined
			? {
					date: {
						$gte: `${year}-01-01`,
						$lte: `${year}-12-31`,
					},
				}
			: {};

	return await getDataWithLocalization({
		endpoint: "/api/posts",
		locale: locale,
		filters: filter,
		pagination: {
			pageSize: limit,
			page: page,
			withCount: true,
		},
		sorts: ["date:desc"],
		populate: ["thumbnail", "localizations"],
		multipleData: true,
		includeMeta: true,
	});
}

export async function getNewsYears(): Promise<number[]> {
	const query = {
		fields: "date",
		pagination: {
			page: 1,
			pageSize: 1000,
		},
		sort: "date:desc",
	};

	const result: DataPagination<Post> = await fetchWithAuth(
		`/api/posts?${QueryString.stringify(query, { skipNulls: true })}`,
		{
			cache: "force-cache",
		},
	);

	const years = [
		...new Set(result.data.map((post) => new Date(post.date).getFullYear())),
	];

	return years;
}

export async function getNewsDetail({
	locale,
	slug,
}: {
	locale: string;
	slug: string;
}): Promise<Post> {
	const result = await getDataWithLocalization({
		endpoint: "/api/posts",
		locale: locale,
		filters: {
			slug: {
				$eq: slug,
			},
		},
		multipleData: false,
		populate: ["thumbnail", "seo", "seo.metaImage"],
	});
	return result;
}

export async function getRelatedNews({
	locale,
	limit,
	currenNews,
}: {
	locale: string;
	limit: number;
	currenNews?: Post;
}): Promise<Post[] | null> {
	const pagination = {
		pageSize: limit,
		page: 1,
	};

	return await getDataWithLocalization({
		endpoint: "/api/posts",
		locale: locale,
		filters: {
			slug: {
				$ne: currenNews?.slug,
			},
		},
		pagination: pagination,
		multipleData: true,
		populate: ["thumbnail"],
	});
}

/**
 * The getDataWithLocalization function fetches data from a specified endpoint
 *  and supports localization. It retrieves the data based on the provided filters
 * and locale, and it handles both single-type and multiple-type data structures.
 *
 * ### Scenario to retrieve strapi API data with localization:
 * - Getting data with default localization, current default localization is `en`
 * - Retrieving data with default localization means that if there is no localization request from the client, it will return default localization data
 * - And also for data that requires a slug in the collection, the default localization is the key slug to get the target slug data in the localization requested by the client
 * - If the default data exists and the localization request does not exist, it will return the default localization data
 * - If data with default localization does not exist, it will directly request localized data with local slug
 * - If all criteria are not met, it will return null
 *
 * ### Parameters:
 * - `endpoint` (string): The API endpoint to fetch data from.
 * - `locale` (string | null): The locale for which the data should be localized. If null, the default locale will be used.
 * - `filters` (Record<string, any>): Filters to be applied to the query.
 * - `populate` (any): Fields to be populated in the query.
 * - `singleType` (boolean, optional): Indicates whether the data being fetched is of a single type strapi. Defaults to false.
 * - `multipleData` (boolean): Returns data with the array data type
 * - `includeMeta` (boolean): Returns an object with meta and data in the same object
 * - `pagination` (PaginationParams): Data pagination filter when the data is a collection
 * - `ignoreLocalization` (boolean): Get data without localization
 */
export async function getDataWithLocalization({
	endpoint,
	locale,
	filters,
	populate,
	singleType = false,
	multipleData = false,
	includeMeta = false,
	pagination,
	sorts,
	ignoreLocalization = false,
}: {
	endpoint: string;
	locale: string | null;
	filters: Filters;
	populate: unknown;
	singleType?: boolean;
	multipleData?: boolean;
	includeMeta?: boolean;
	pagination?: PaginationParams;
	sorts?: string[];
	ignoreLocalization?: boolean;
}) {
	const query: Record<string, unknown> = {
		filters: filters,
		populate: populate,
	};

	// Only add locale if not ignoring localization
	if (!ignoreLocalization) {
		query.locale = locale;
	}

	if (pagination && pagination !== null && pagination !== undefined) {
		query.pagination = pagination;
	}

	if (sorts) {
		query.sort = sorts;
	}

	const queryParsed = QueryString.stringify(query, { skipNulls: true });
	const result = await fetchWithAuth(`${endpoint}?${queryParsed}`);

	const isValidData = () => {
		if (!multipleData) {
			const isArray = Array.isArray(result.data);
			const isValid = isArray ? result.data.length > 0 : true;
			return isValid;
		}
		return true;
	};

	const isValid = result !== null && isValidData();
	if (isValid) {
		return _getDataFromRequest({
			originalData: result,
			includeMeta: includeMeta,
			multipleData: multipleData,
			singleType: singleType,
		});
	} else {
		const defaultLocaleQuery = Object.assign({}, query) as Filters;
		if (locale && !ignoreLocalization) {
			defaultLocaleQuery.locale = DEFAULT_LANGUAGE_CODE;
		}

		const queryParsed = QueryString.stringify(defaultLocaleQuery, {
			skipNulls: true,
		});

		const localeResult = await fetchWithAuth(`${endpoint}?${queryParsed}`);
		return _getDataFromRequest({
			originalData: localeResult,
			includeMeta: includeMeta,
			multipleData: multipleData,
			singleType: singleType,
		});
	}
}

function _getDataFromRequest({
	originalData,
	singleType,
	multipleData,
	includeMeta,
}: {
	originalData: {
		data: unknown;
		meta: unknown;
	};
	singleType: boolean;
	multipleData: boolean;
	includeMeta: boolean;
}) {
	const getSingleDataInArray = () => {
		if (Array.isArray(originalData.data) && originalData.data.length > 0) {
			return originalData.data.find(
				(item) => item !== null && item !== undefined,
			);
		}
		return null;
	};

	const data = singleType
		? originalData.data
		: multipleData
			? originalData.data
			: getSingleDataInArray();

	if (includeMeta) {
		return {
			data: data ?? null,
			meta: originalData.meta,
		};
	}

	return data ?? null;
}

export async function getCsr({
	locale,
	limit,
	page,
	year,
}: {
	locale: string;
	limit: number;
	page: number;
	year?: number;
}): Promise<DataPagination<Post>> {
	const filter =
		year !== undefined
			? {
					date: {
						$gte: `${year}-01-01`,
						$lte: `${year}-12-31`,
					},
				}
			: {};

	return await getDataWithLocalization({
		endpoint: "/api/csrs",
		locale: locale,
		filters: filter,
		pagination: {
			pageSize: limit,
			page: page,
			withCount: true,
		},
		sorts: ["date:desc"],
		populate: ["thumbnail", "localizations"],
		multipleData: true,
		includeMeta: true,
	});
}

export async function getCsrDetail({
	locale,
	slug,
}: {
	locale: string;
	slug: string;
}): Promise<Post> {
	const result = await getDataWithLocalization({
		endpoint: "/api/csrs",
		locale: locale,
		filters: {
			slug: {
				$eq: slug,
			},
		},
		multipleData: false,
		populate: ["thumbnail", "seo", "seo.metaImage"],
	});
	return result;
}

export async function getWebIntro({
	locale,
}: {
	locale: string | null;
}): Promise<{ title: unknown; description: unknown } | null> {
	return await getDataWithLocalization({
		endpoint: "/api/web-intro",
		filters: {},
		singleType: true,
		locale: locale,
	});
}

export async function getRelatedCsr({
	locale,
	limit,
	currentCSR,
}: {
	locale: string;
	limit: number;
	currentCSR?: Post;
}): Promise<Post[] | null> {
	const pagination = {
		pageSize: limit,
		page: 1,
	};

	return await getDataWithLocalization({
		endpoint: "/api/csrs",
		locale: locale,
		filters: {
			slug: {
				$ne: currentCSR?.slug,
			},
		},
		pagination: pagination,
		multipleData: true,
		populate: ["thumbnail"],
	});
}

export async function getHomeSlider({
	locale,
}: {
	locale: string | null;
}): Promise<HomeSlider | null> {
	return await getDataWithLocalization({
		endpoint: "/api/home-slider",
		filters: {},
		populate: ["slider", "slider.image"],
		singleType: true,
		locale: locale,
	});
}

export async function getProjects({
	locale,
	limit = 12,
	page = 1,
	category,
}: {
	locale: string | null;
	limit?: number;
	page?: number;
	category?: string;
}): Promise<{ data: Project[]; total: number }> {
	const filters: Filters = category ? { category: { $eq: category } } : {};

	const result = (await getDataWithLocalization({
		endpoint: "/api/projects",
		locale: locale,
		filters: filters,
		pagination: {
			pageSize: limit,
			page: page,
			withCount: true,
		},
		sorts: ["createdAt:desc"],
		populate: ["cover", "cover.image", "gallery"],
		multipleData: true,
		includeMeta: true,
		ignoreLocalization: true,
	})) as { data: any[]; meta: { pagination: { total: number } } } | null;

	console.log("[getProjects] Raw result:", JSON.stringify(result, null, 2));

	if (!result || !result.data) {
		console.log("[getProjects] No data returned");
		return { data: [], total: 0 };
	}

	const projects: Project[] = result.data.map((item: any) => {
		const attrs = item.attributes || item;
		return {
			id: item.id,
			title: attrs.title || "",
			slug: attrs.slug || "",
			description: attrs.description,
			category: attrs.category || "Branding",
			cover: transformCover(attrs.cover),
			years: attrs.years || "",
			gallery: transformGallery(attrs.gallery),
			createdAt: attrs.createdAt || "",
			updatedAt: attrs.updatedAt || "",
		};
	});

	console.log("[getProjects] Transformed projects:", projects.length);

	return {
		data: projects,
		total: result.meta?.pagination?.total || 0,
	};
}

export async function getProject({
	locale,
	slug,
}: {
	locale: string | null;
	slug: string;
}): Promise<Project | null> {
	try {
		const result = await getDataWithLocalization({
			endpoint: "/api/projects",
			locale,
			filters: { slug: { $eq: slug } },

			// ✅ STRAPI V5 SAFE POPULATE
			populate: {
				cover: {
					populate: {
						image: true,
					},
				},
				gallery: true,
				seo: {
					populate: {
						metaImage: true,
					},
				},
			},

			multipleData: false,
			ignoreLocalization: true,
		});

		if (!result) return null;

		const rawData = Array.isArray(result) ? result[0] : result;
		if (!rawData) return null;

		const attrs = rawData.attributes || rawData;

		return {
			id: rawData.id,
			title: attrs.title || "",
			slug: attrs.slug || slug,
			description: attrs.description,
			category: attrs.category || "Branding",
			cover: transformCover(attrs.cover),
			years: attrs.years || "",
			gallery: transformGallery(attrs.gallery),
			createdAt: attrs.createdAt || "",
			updatedAt: attrs.updatedAt || "",
		};
	} catch (error) {
		console.error("[getProject] Error:", error);
		return null;
	}
}

function transformCover(cover: any): {
	id: number;
	image: {
		id: number;
		url: string;
		width: number;
		height: number;
		name: string;
		size: number;
	};
} | null {
	if (!cover?.image) return null;

	const imageData = cover.image?.data || cover.image;
	const imgAttrs = imageData?.attributes || imageData;

	return {
		id: cover.id || imageData?.id || 0,
		image: {
			id: imageData?.id || 0,
			url: imgAttrs?.url || "",
			width: imgAttrs?.width || 0,
			height: imgAttrs?.height || 0,
			name: imgAttrs?.name || "",
			size: imgAttrs?.size || 0,
		},
	};
}

function transformGallery(gallery: any): {
	id: number;
	url: string;
	width: number;
	height: number;
	name: string;
	size: number;
}[] {
	if (!gallery) return [];

	const items = Array.isArray(gallery)
		? gallery
		: gallery.data && Array.isArray(gallery.data)
			? gallery.data
			: [gallery];

	return items
		.filter((item: any) => item)
		.map((item: any) => {
			const data = item?.data || item;
			const attrs = data?.attributes || data;

			return {
				id: data?.id || 0,
				url: attrs?.url || "",
				width: attrs?.width || 0,
				height: attrs?.height || 0,
				name: attrs?.name || "",
				size: attrs?.size || 0,
			};
		});
}

function transformThumbnail(thumbnail: any): ImageType | null {
	if (!thumbnail) return null;

	const data = thumbnail?.data || thumbnail;
	const attrs = data?.attributes || data;

	if (!attrs?.url) return null;

	return {
		id: data?.id || 0,
		url: attrs.url,
		width: attrs.width || 0,
		height: attrs.height || 0,
		name: attrs.name || "",
		size: attrs.size || 0,
	};
}

export async function getSocialMedia({
	locale,
}: {
	locale: string | null;
}): Promise<SocialMedia | null> {
	const result = await getDataWithLocalization({
		endpoint: "/api/social-media",
		populate: {
			social: {
				populate: {
					thumbnail: true,
				},
			},
		},
		singleType: true,
		locale: locale,
		ignoreLocalization: true,
	});

	if (!result) return null;

	const rawData = result as any;
	const attrs = rawData.attributes || rawData;

	const socialItems: SocialMedia["social"] = (attrs.social || []).map(
		(item: any) => {
			const itemAttrs = item.attributes || item;
			return {
				id: item.id || 0,
				name: itemAttrs.name || "",
				link: itemAttrs.link || "",
				thumbnail: transformThumbnail(itemAttrs.thumbnail),
				description: itemAttrs.description,
			};
		},
	);

	return {
		id: rawData.id || 0,
		title: attrs.title || "",
		social: socialItems,
	};
}

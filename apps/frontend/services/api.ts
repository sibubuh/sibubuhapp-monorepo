import QueryString from "qs";

import { DEFAULT_LANGUAGE_CODE } from "../config/metadata";
import {
	DataPagination,
	Filters,
	Footer,
	Navbar,
	Page,
	PaginationParams,
	Post,
	ShareButton,
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
		locale: ignoreLocalization ? null : locale,
		filters: filters,
		populate: populate,
	};

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

			return ignoreLocalization ? false : isValid;
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

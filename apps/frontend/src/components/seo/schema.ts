import {
	SITE_AUTHOR,
	SITE_DESCRIPTION,
	SITE_EMAIL,
	SITE_NAME,
	SITE_URL,
} from "../../../config/metadata";
import { absoluteUrl } from "./head";

/**
 * Stable @id values let the separate nodes below reference each other instead
 * of repeating themselves, which is how search engines merge them into one
 * entity rather than several look-alikes.
 */
const WEBSITE_ID = `${SITE_URL}/#website`;
const PERSON_ID = `${SITE_URL}/#person`;

/** The owner of the site — a person, not a company. */
export function buildPersonSchema(sameAs: string[] = []) {
	return {
		"@type": "Person",
		"@id": PERSON_ID,
		name: SITE_AUTHOR,
		url: SITE_URL,
		email: SITE_EMAIL,
		description: SITE_DESCRIPTION,
		// A reachable contact point is one of the entity-validation signals AI
		// engines look for before treating a site as a real, attributable source.
		contactPoint: {
			"@type": "ContactPoint",
			contactType: "Business inquiries",
			email: SITE_EMAIL,
			availableLanguage: ["Indonesian", "English"],
		},
		address: {
			"@type": "PostalAddress",
			addressLocality: "Sukabumi",
			addressRegion: "West Java",
			addressCountry: "ID",
		},
		// sameAs is what lets the Knowledge Graph tie this site to the same
		// person on other platforms, so only verified profile URLs belong here.
		...(sameAs.length > 0 ? { sameAs } : {}),
	};
}

export function buildWebSiteSchema() {
	return {
		"@type": "WebSite",
		"@id": WEBSITE_ID,
		url: SITE_URL,
		name: SITE_NAME,
		description: SITE_DESCRIPTION,
		inLanguage: "en",
		publisher: { "@id": PERSON_ID },
	};
}

export function buildWebPageSchema({
	path,
	name,
	description,
	dateModified,
}: {
	path: string;
	name: string;
	description?: string;
	dateModified?: string;
}) {
	const url = absoluteUrl(path);
	return {
		"@type": "WebPage",
		"@id": `${url}#webpage`,
		url,
		name,
		...(description ? { description } : {}),
		...(dateModified ? { dateModified } : {}),
		isPartOf: { "@id": WEBSITE_ID },
		about: { "@id": PERSON_ID },
		inLanguage: "en",
	};
}

export function buildBreadcrumbSchema(
	items: Array<{ name: string; path: string }>,
) {
	return {
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: absoluteUrl(item.path),
		})),
	};
}

export function buildCreativeWorkSchema(project: {
	title: string;
	slug: string;
	description?: string;
	category?: string;
	image?: string;
	createdAt?: string;
	updatedAt?: string;
}) {
	const url = absoluteUrl(`/projects/${project.slug}`);
	return {
		"@type": "CreativeWork",
		"@id": `${url}#project`,
		url,
		name: project.title,
		...(project.description ? { description: project.description } : {}),
		...(project.category ? { genre: project.category } : {}),
		...(project.image ? { image: project.image } : {}),
		...(project.createdAt ? { dateCreated: project.createdAt } : {}),
		...(project.updatedAt ? { dateModified: project.updatedAt } : {}),
		creator: { "@id": PERSON_ID },
		isPartOf: { "@id": WEBSITE_ID },
	};
}

/**
 * A story imported from the bubuh.id blog. `url` is passed in rather than
 * derived, because story URLs mirror Blogger's `/YYYY/MM/slug.html` shape.
 */
export function buildBlogPostingSchema(story: {
	title: string;
	path: string;
	description?: string;
	image?: string;
	keywords?: string[];
	publishedDate?: string;
	updatedDate?: string;
	wordCount?: number;
}) {
	const url = absoluteUrl(story.path);
	return {
		"@type": "BlogPosting",
		"@id": `${url}#story`,
		url,
		mainEntityOfPage: { "@type": "WebPage", "@id": url },
		headline: story.title,
		...(story.description ? { description: story.description } : {}),
		...(story.image ? { image: story.image } : {}),
		...(story.keywords?.length ? { keywords: story.keywords.join(", ") } : {}),
		...(story.publishedDate ? { datePublished: story.publishedDate } : {}),
		...(story.updatedDate
			? { dateModified: story.updatedDate }
			: story.publishedDate
				? { dateModified: story.publishedDate }
				: {}),
		...(story.wordCount ? { wordCount: story.wordCount } : {}),
		inLanguage: "id",
		author: { "@id": PERSON_ID },
		publisher: { "@id": PERSON_ID },
		isPartOf: { "@id": WEBSITE_ID },
	};
}

export function buildItemListSchema(
	items: Array<{ name: string; path: string }>,
) {
	return {
		"@type": "ItemList",
		numberOfItems: items.length,
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			url: absoluteUrl(item.path),
		})),
	};
}

/** Wraps nodes in a single @graph so one script tag carries the whole page. */
export function buildGraph(nodes: unknown[]) {
	return {
		"@context": "https://schema.org",
		"@graph": nodes.filter(Boolean),
	};
}

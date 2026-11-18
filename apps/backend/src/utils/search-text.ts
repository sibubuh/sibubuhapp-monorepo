/**
 * Flattens a document's text into the plain `searchText` column so `page` and
 * `project` can be filtered with `$containsi`. Their body lives in a dynamic
 * zone and in `blocks` fields, and Strapi's REST filters reach neither.
 */

/**
 * Keys whose values are structural or technical, never prose. `type` matters
 * most: blocks nodes carry `{ type: "paragraph" }`, and without this every
 * document would match a search for "paragraph".
 */
const SKIP_KEYS = new Set([
	"__component",
	"__pivot",
	"id",
	"documentId",
	"type",
	"format",
	"formats",
	"level",
	"url",
	"href",
	"hash",
	"ext",
	"mime",
	"provider",
	"provider_metadata",
	"previewUrl",
	"locale",
	"searchText",
	"createdAt",
	"updatedAt",
	"publishedAt",
	"firstPublishedAt",
]);

/** Pages built from raw HTML or richtext would otherwise store their markup. */
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ");

// A page body is a few KB at most; the cap only guards against a runaway import.
const MAX_LENGTH = 200_000;

export function flattenText(value: unknown): string {
	const parts: string[] = [];

	const walk = (node: unknown) => {
		if (node === null || node === undefined) return;

		if (typeof node === "string") {
			parts.push(stripHtml(node));
			return;
		}

		if (Array.isArray(node)) {
			for (const item of node) walk(item);
			return;
		}

		if (typeof node === "object") {
			for (const [key, child] of Object.entries(node)) {
				if (SKIP_KEYS.has(key)) continue;
				walk(child);
			}
		}
	};

	walk(value);

	return parts.join(" ").replace(/\s+/g, " ").trim().slice(0, MAX_LENGTH);
}

type PopulateMap = Record<string, unknown>;

/**
 * Builds a populate object deep enough to reach components nested inside
 * dynamic-zone components. `populate: "*"` only goes one level, so a repeatable
 * component inside a section would come back empty.
 *
 * Only component and dynamic-zone attributes are traversed — media and
 * relations carry no searchable prose and would bloat the query.
 */
export function buildComponentPopulate(
	uid: string,
	strapi: {
		contentTypes: Record<string, any>;
		components: Record<string, any>;
	},
): PopulateMap | undefined {
	const schema = strapi.contentTypes[uid];
	if (!schema) return undefined;
	return populateForAttributes(schema.attributes, strapi, new Set());
}

function populateForAttributes(
	attributes: Record<string, any>,
	strapi: { components: Record<string, any> },
	seen: Set<string>,
): PopulateMap | undefined {
	const populate: PopulateMap = {};

	for (const [name, attribute] of Object.entries(attributes || {})) {
		if (attribute?.type === "component") {
			populate[name] = nested(attribute.component, strapi, seen);
		} else if (attribute?.type === "dynamiczone") {
			// Dynamic zones only accept the `on` form for a nested populate.
			const on: PopulateMap = {};
			for (const component of attribute.components || []) {
				on[component] = nested(component, strapi, seen);
			}
			populate[name] = { on };
		}
	}

	return Object.keys(populate).length > 0 ? populate : undefined;
}

/** `seen` breaks the cycle a self-referencing component would otherwise create. */
function nested(
	componentUid: string,
	strapi: { components: Record<string, any> },
	seen: Set<string>,
): { populate: PopulateMap } | true {
	if (seen.has(componentUid)) return true;

	const component = strapi.components[componentUid];
	if (!component) return true;

	const inner = populateForAttributes(
		component.attributes,
		strapi,
		new Set([...seen, componentUid]),
	);

	return inner ? { populate: inner } : true;
}

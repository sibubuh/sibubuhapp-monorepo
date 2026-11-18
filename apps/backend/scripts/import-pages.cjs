#!/usr/bin/env node
/**
 * Seeds the `page` entries a Google AdSense review needs: a full Privacy
 * Policy, plus publisher-identity and contact blocks appended to the existing
 * About and Contact pages.
 *
 * Boots Strapi in-process (same pattern as import-stories.cjs). Idempotent and
 * additive: a missing page is created, an existing one only gains the seed
 * sections whose heading is not already on it.
 *
 * Appending to a dynamic zone means rewriting the whole zone — Strapi has no
 * "push one section" primitive — so the existing sections are read back and
 * resent. Everything below exists to make that round trip lossless against
 * production content: a populate deep enough to reach media nested inside
 * repeatable components, media and relations reduced back to the ids Strapi
 * writes, a backup of the zone before the write, and a media check after it
 * that aborts if anything went missing.
 *
 *   pnpm --filter=backend run import:pages [--dry-run]
 */

const fs = require("node:fs");
const path = require("node:path");
const strapiFactory = require("@strapi/strapi");

const seedDir = path.resolve(__dirname, "..", "database", "seeds");
// Overridable so the media round trip can be exercised against a throwaway
// fixture page instead of the real About and Contact pages.
const seedFile = process.env.PAGES_SEED || path.join(seedDir, "pages.json");

const DRY_RUN = process.argv.includes("--dry-run");

// Tearing down Strapi rejects any pending knex pool acquisition with
// "aborted". It surfaces as an unhandled rejection that would crash the
// process after the import has already succeeded.
process.on("unhandledRejection", (error) => {
	if (String(error && error.message) === "aborted") return;
	throw error;
});

/* --------------------------------------------------------------- populate */

/**
 * A populate map covering components, dynamic zones, media and relations, at
 * every depth. `populate: "*"` only reaches one level, so an image inside a
 * repeatable component inside a section would come back missing — and sending
 * that back would delete it.
 *
 * `buildComponentPopulate` in src/utils/search-text.ts walks the same schema
 * but deliberately skips media and relations, which is exactly what must not
 * be skipped here.
 */
function fullPopulate(uid, strapi) {
	const schema = strapi.contentTypes[uid];
	if (!schema) return undefined;
	return populateForAttributes(schema.attributes, strapi, new Set());
}

function populateForAttributes(attributes, strapi, seen) {
	const populate = {};

	for (const [name, attribute] of Object.entries(attributes || {})) {
		const type = attribute && attribute.type;

		if (type === "component") {
			populate[name] = nested(attribute.component, strapi, seen);
		} else if (type === "dynamiczone") {
			// Dynamic zones only accept the `on` form for a nested populate.
			const on = {};
			for (const component of attribute.components || []) {
				on[component] = nested(component, strapi, seen);
			}
			populate[name] = { on };
		} else if (type === "media" || type === "relation") {
			populate[name] = true;
		}
	}

	return Object.keys(populate).length > 0 ? populate : undefined;
}

/** `seen` breaks the cycle a self-referencing component would otherwise create. */
function nested(componentUid, strapi, seen) {
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

/* -------------------------------------------------------------- writeback */

/**
 * Read-only bookkeeping Strapi rejects or ignores on the way back in.
 *
 * `id` has to go: the ids read from the published entry belong to different
 * component rows than the draft the update writes, and sending them back is
 * rejected with "Some of the provided components are not related to the
 * entity". Media is reduced to its own id before this set is applied, so
 * dropping `id` here costs no images.
 */
const WRITE_SKIP = new Set([
	"id",
	"documentId",
	"createdAt",
	"updatedAt",
	"publishedAt",
	"firstPublishedAt",
	"createdBy",
	"updatedBy",
	"locale",
	"localizations",
]);

/** A populated upload file, as opposed to a component or a blocks node. */
function isMediaFile(value) {
	return (
		typeof value.id === "number" &&
		(typeof value.mime === "string" ||
			(typeof value.url === "string" && typeof value.hash === "string"))
	);
}

/** A populated entry from another content type. Components carry no documentId. */
function isRelatedEntry(value) {
	return typeof value.documentId === "string" && !isMediaFile(value);
}

/**
 * Turns a populated section back into something the document service accepts:
 * components as plain objects, media as the numeric id Strapi stores, and
 * related entries as their documentId.
 */
function toWritable(value) {
	if (Array.isArray(value)) return value.map(toWritable);

	if (value && typeof value === "object") {
		if (isMediaFile(value)) return value.id;
		if (isRelatedEntry(value)) return value.documentId;

		const output = {};
		for (const [key, inner] of Object.entries(value)) {
			if (WRITE_SKIP.has(key)) continue;
			output[key] = toWritable(inner);
		}
		return output;
	}

	return value;
}

/** Every upload id reachable in a populated tree, for the before/after check. */
function mediaIds(value, found = new Set()) {
	if (Array.isArray(value)) {
		for (const item of value) mediaIds(item, found);
	} else if (value && typeof value === "object") {
		if (isMediaFile(value)) found.add(value.id);
		for (const inner of Object.values(value)) mediaIds(inner, found);
	}
	return found;
}

/* --------------------------------------------------------------- identity */

/** Concatenated text of a blocks node, used to identify a section. */
function textOf(node) {
	if (!node) return "";
	if (typeof node.text === "string") return node.text;
	if (!Array.isArray(node.children)) return "";
	return node.children.map(textOf).join("");
}

/**
 * A stable key for a dynamic-zone section, so a re-run can tell "already
 * seeded" from "the editor wrote something else". Sections we cannot key are
 * reported rather than appended blindly.
 */
function sectionKey(section) {
	if (!section) return null;

	if (section.__component === "sections.text-headline") {
		return section.title ? `headline:${section.title.trim()}` : null;
	}

	if (section.__component === "sections.rich-text-section") {
		const blocks = Array.isArray(section.content) ? section.content : [];
		const heading = blocks.find((block) => block && block.type === "heading");
		const text = textOf(heading).trim();
		return text ? `heading:${text}` : null;
	}

	return null;
}

/* ------------------------------------------------------------------- main */

async function main() {
	if (!fs.existsSync(seedFile)) {
		throw new Error(`${path.relative(process.cwd(), seedFile)} not found.`);
	}

	const seed = JSON.parse(fs.readFileSync(seedFile, "utf8"));
	const locale = seed.locale || "en";
	const pages = seed.pages || [];

	console.log(
		`Loaded ${pages.length} page seed(s) for locale "${locale}"${DRY_RUN ? " (dry run)" : ""}.`,
	);

	const app = await strapiFactory
		.createStrapi({ distDir: path.resolve(__dirname, "..", "dist") })
		.load();

	const populate = fullPopulate("api::page.page", app);
	const stats = { created: 0, appended: 0, unchanged: 0, skipped: 0 };
	const failures = [];

	try {
		for (const page of pages) {
			const read = () =>
				app.documents("api::page.page").findFirst({
					filters: { slug: page.slug },
					locale,
					status: "published",
					populate,
				});

			const existing = await read();

			if (!existing) {
				if (page.appendOnly) {
					console.log(
						`  - ${page.slug}: not found and marked append-only, skipped. Create it in the admin first.`,
					);
					stats.skipped += 1;
					continue;
				}

				if (DRY_RUN) {
					console.log(
						`  + ${page.slug}: would create with ${page.sections.length} section(s).`,
					);
					stats.created += 1;
					continue;
				}

				await app.documents("api::page.page").create({
					data: {
						title: page.title,
						slug: page.slug,
						sections: page.sections,
						seo: page.seo,
					},
					locale,
					status: "published",
				});
				console.log(`  + ${page.slug}: created.`);
				stats.created += 1;
				continue;
			}

			const sections = existing.sections || [];
			const presentKeys = new Set(sections.map(sectionKey).filter(Boolean));
			const missing = page.sections.filter((section) => {
				const key = sectionKey(section);
				if (!key) {
					console.warn(
						`  ! ${page.slug}: a seed section has no heading to key on, skipped.`,
					);
					return false;
				}
				return !presentKeys.has(key);
			});

			if (missing.length === 0) {
				console.log(`  = ${page.slug}: already up to date.`);
				stats.unchanged += 1;
				continue;
			}

			const before = mediaIds(sections);

			if (DRY_RUN) {
				console.log(
					`  ~ ${page.slug}: would append ${missing.length} section(s): ${missing.map(sectionKey).join(", ")}. ${sections.length} existing section(s), ${before.size} media file(s) to carry over.`,
				);
				stats.appended += 1;
				continue;
			}

			// Written before the update, not after, so a bad round trip is always
			// recoverable by hand from the populated original.
			const backupFile = path.join(
				seedDir,
				`pages.backup-${page.slug}-${Date.now()}.json`,
			);
			fs.writeFileSync(backupFile, JSON.stringify(sections, null, 2));

			await app.documents("api::page.page").update({
				documentId: existing.documentId,
				locale,
				status: "published",
				data: { sections: [...sections.map(toWritable), ...missing] },
			});

			const after = mediaIds((await read()).sections || []);
			const lost = [...before].filter((id) => !after.has(id));

			if (lost.length > 0) {
				failures.push(page.slug);
				console.error(
					`  ! ${page.slug}: ${lost.length} media file(s) lost in the update (ids ${lost.join(", ")}). Restore the sections by hand from ${path.relative(process.cwd(), backupFile)}.`,
				);
				continue;
			}

			fs.unlinkSync(backupFile);
			console.log(
				`  ~ ${page.slug}: appended ${missing.length} section(s), ${after.size} media file(s) intact.`,
			);
			stats.appended += 1;
		}

		console.log("\nDone.");
		console.log(`  created   : ${stats.created}`);
		console.log(`  appended  : ${stats.appended}`);
		console.log(`  unchanged : ${stats.unchanged}`);
		console.log(`  skipped   : ${stats.skipped}`);
		if (failures.length > 0) {
			console.error(`  FAILED    : ${failures.join(", ")}`);
		}
	} finally {
		// Strapi's knex pool rejects pending acquisitions with "aborted" on
		// shutdown; that is noise once the import itself has finished.
		await app.destroy().catch(() => {});
	}

	process.exit(failures.length > 0 || stats.skipped > 0 ? 1 : 0);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});

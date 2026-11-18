#!/usr/bin/env node
/**
 * Seeds the `page` entries a Google AdSense review needs: a full Privacy
 * Policy, plus publisher-identity and contact blocks appended to the existing
 * About and Contact pages.
 *
 * Boots Strapi in-process (same pattern as import-stories.cjs). Idempotent and
 * additive: a missing page is created, an existing one only gains the seed
 * sections whose heading is not already on it. Existing sections, media and
 * SEO are never overwritten — this runs against production content.
 *
 *   pnpm --filter=backend run import:pages [--dry-run]
 */

const fs = require("node:fs");
const path = require("node:path");
const strapiFactory = require("@strapi/strapi");

const seedFile = path.resolve(
	__dirname,
	"..",
	"database",
	"seeds",
	"pages.json",
);

const DRY_RUN = process.argv.includes("--dry-run");

// Tearing down Strapi rejects any pending knex pool acquisition with
// "aborted". It surfaces as an unhandled rejection that would crash the
// process after the import has already succeeded.
process.on("unhandledRejection", (error) => {
	if (String(error && error.message) === "aborted") return;
	throw error;
});

/* -------------------------------------------------------------- identity */

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

/** Strips the database ids Strapi adds to stored components. */
function stripIds(value) {
	if (Array.isArray(value)) return value.map(stripIds);
	if (value && typeof value === "object") {
		const output = {};
		for (const [key, inner] of Object.entries(value)) {
			if (key === "id") continue;
			output[key] = stripIds(inner);
		}
		return output;
	}
	return value;
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

	const stats = { created: 0, appended: 0, unchanged: 0, skipped: 0 };

	try {
		for (const page of pages) {
			const existing = await app.documents("api::page.page").findFirst({
				filters: { slug: page.slug },
				locale,
				status: "published",
				populate: { sections: { populate: "*" } },
			});

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

			const presentKeys = new Set(
				(existing.sections || []).map(sectionKey).filter(Boolean),
			);
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

			if (DRY_RUN) {
				console.log(
					`  ~ ${page.slug}: would append ${missing.length} section(s): ${missing.map(sectionKey).join(", ")}.`,
				);
				stats.appended += 1;
				continue;
			}

			await app.documents("api::page.page").update({
				documentId: existing.documentId,
				locale,
				status: "published",
				data: {
					sections: [...stripIds(existing.sections || []), ...missing],
				},
			});
			console.log(`  ~ ${page.slug}: appended ${missing.length} section(s).`);
			stats.appended += 1;
		}

		console.log("\nDone.");
		console.log(`  created   : ${stats.created}`);
		console.log(`  appended  : ${stats.appended}`);
		console.log(`  unchanged : ${stats.unchanged}`);
		console.log(`  skipped   : ${stats.skipped}`);
	} finally {
		// Strapi's knex pool rejects pending acquisitions with "aborted" on
		// shutdown; that is noise once the import itself has finished.
		await app.destroy().catch(() => {});
	}

	process.exit(stats.skipped > 0 ? 1 : 0);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});

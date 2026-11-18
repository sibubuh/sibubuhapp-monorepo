import assert from "node:assert/strict";
import { test } from "node:test";

import { buildComponentPopulate, flattenText } from "./search-text.ts";

test("flattenText collects prose from a dynamic zone", () => {
	const text = flattenText({
		title: "Tentang Kami",
		sections: [
			{
				__component: "sections.raw-html",
				id: 4,
				content: "<p>Halo <strong>dunia</strong></p>",
			},
			{
				__component: "sections.quote",
				id: 5,
				text: "Kutipan penting",
				author: "Bukhori",
			},
			{
				__component: "sections.rich-text-section",
				id: 6,
				content: [
					{
						type: "paragraph",
						children: [{ type: "text", text: "Isi richtext" }],
					},
				],
			},
		],
	});

	assert.match(text, /Tentang Kami/);
	assert.match(text, /Halo dunia/);
	assert.match(text, /Kutipan penting/);
	assert.match(text, /Bukhori/);
	assert.match(text, /Isi richtext/);

	// Structural noise must not become searchable.
	assert.doesNotMatch(text, /paragraph/);
	assert.doesNotMatch(text, /sections\./);
	assert.doesNotMatch(text, /<|>/);
});

test("flattenText skips technical fields and collapses whitespace", () => {
	const text = flattenText({
		title: "  Judul   Panjang  ",
		searchText: "jangan ikut",
		cover: { id: 1, url: "/uploads/a.png", mime: "image/png", name: "a.png" },
		updatedAt: "2026-01-01T00:00:00.000Z",
	});

	assert.equal(text, "Judul Panjang a.png");
});

test("buildComponentPopulate reaches components nested in a dynamic zone", () => {
	const strapi = {
		contentTypes: {
			"api::page.page": {
				attributes: {
					title: { type: "string" },
					seo: { type: "component", component: "shared.seo" },
					cover: { type: "media" },
					sections: { type: "dynamiczone", components: ["sections.timelines"] },
				},
			},
		},
		components: {
			"shared.seo": { attributes: { metaTitle: { type: "string" } } },
			"sections.timelines": {
				attributes: {
					title: { type: "string" },
					milestones: {
						type: "component",
						repeatable: true,
						component: "repeatable.milestone",
					},
				},
			},
			"repeatable.milestone": { attributes: { label: { type: "string" } } },
		},
	};

	assert.deepEqual(buildComponentPopulate("api::page.page", strapi), {
		seo: true,
		sections: {
			on: {
				"sections.timelines": { populate: { milestones: true } },
			},
		},
	});
});

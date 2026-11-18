import { buildComponentPopulate, flattenText } from "./utils/search-text";

/**
 * Content types whose body lives in a dynamic zone or in `blocks` fields.
 * Neither is reachable by a REST `filters` query, so a flat `searchText`
 * column is kept in sync for them. `story` already ships `contentText`.
 */
const SEARCHABLE_UIDS = ["api::page.page", "api::project.project"];

export default {
	/**
	 * An asynchronous register function that runs before
	 * your application is initialized.
	 *
	 * This gives you an opportunity to extend code.
	 */
	register({ strapi }: { strapi: any }) {
		/**
		 * A document service middleware, not a `lifecycles.ts` hook: lifecycles run
		 * at the database layer, where the dynamic zone has already been replaced
		 * by `{ id, __component }` references and the text is gone.
		 */
		strapi.documents.use(async (ctx: any, next: any) => {
			if (!SEARCHABLE_UIDS.includes(ctx.uid)) return next();
			if (ctx.action !== "create" && ctx.action !== "update") return next();

			const data = ctx.params?.data;
			if (!data) return next();

			// An update may be partial, so start from the stored document and let
			// the incoming fields win.
			let base: unknown = null;
			if (ctx.action === "update" && ctx.params?.documentId) {
				base = await strapi.documents(ctx.uid).findOne({
					documentId: ctx.params.documentId,
					locale: ctx.params.locale,
					populate: buildComponentPopulate(ctx.uid, strapi),
				});
			}

			data.searchText = flattenText({ ...(base as object), ...data });

			return next();
		});
	},

	/**
	 * An asynchronous bootstrap function that runs before
	 * your application gets started.
	 *
	 * This gives you an opportunity to set up your data model,
	 * run jobs, or perform some special logic.
	 */
	async bootstrap({ strapi }: { strapi: any }) {
		await backfillSearchText(strapi);
	},
};

/**
 * Fills `searchText` for entries that predate the column. Idempotent, and after
 * the first run it costs one empty query per content type.
 */
async function backfillSearchText(strapi: any) {
	for (const uid of SEARCHABLE_UIDS) {
		const populate = buildComponentPopulate(uid, strapi);
		let filled = 0;

		for (const status of ["draft", "published"] as const) {
			let documents: any[] = [];
			try {
				documents = await strapi.documents(uid).findMany({
					status,
					populate,
					filters: { searchText: { $null: true } },
				});
			} catch (error) {
				strapi.log.error(`searchText backfill failed for ${uid}: ${error}`);
				return;
			}

			for (const document of documents) {
				const searchText = flattenText(document);
				if (!searchText) continue;

				// Written as a raw row update so the draft/published state is left
				// exactly as the editor left it.
				await strapi.db.query(uid).update({
					where: {
						documentId: document.documentId,
						...(document.locale ? { locale: document.locale } : {}),
						publishedAt: status === "draft" ? null : { $notNull: true },
					},
					data: { searchText },
				});
				filled += 1;
			}
		}

		if (filled > 0) {
			strapi.log.info(`searchText backfilled for ${filled} ${uid} row(s)`);
		}
	}
}

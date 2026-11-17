# AGENTS.md

## Committing

- Stage explicit paths only; never `git add -A` / `git add .`. Verify with `git status` before committing.
- Message format: `{feat,fix,docs,refactor,chore}[(scope)]: <concise message>`.
- Never push. Commits are local unless the user asks for a push.
- Never commit on your own initiative — finish the work, recommend a message, and let the user commit. The exception is an explicit commit instruction in that turn.
- Always close a finished piece of work with a recommended commit title in chat, even when you did not commit. Use the format above, keep it one line, and list the changed paths under it.

Never run: `git reset --hard`, `git checkout .`, `git clean -fd`, `git stash`, `git commit --no-verify`, `git push --force`.

## Switching branches with Strapi running

Stop `strapi develop` before any `git checkout` that changes which content types exist on disk.

Strapi 5 syncs the database schema to the source tree on every restart. Checking out a branch that lacks a content type makes Strapi **drop that type's tables**, and checking the branch back out recreates them empty — the rows do not come back. This has already cost the 219 imported `story` rows once, on 2026-11-17: `apps/backend/src/api/story/` only exists on `chore-schemablogging`, so a round trip through `main` wiped them.

The risk disappears once the content type is merged to `main`.

Recovery, if it happens again: delete the orphaned rows left behind (`files_related_mph` rows with `related_type='api::story.story'`, plus `components_shared_seos` rows no longer referenced by any `*_cmps` table) **before** re-importing — the id sequence resets on a table drop, so stale relations would attach to the wrong records. Then `pnpm --filter=backend run build && pnpm --filter=backend run import:stories`. `database/seeds/stories.json` and `database/seeds/media/` make this a few minutes, not another scrape.

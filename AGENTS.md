# AGENTS.md

## Committing

- Stage explicit paths only; never `git add -A` / `git add .`. Verify with `git status` before committing.
- Message format: `{feat,fix,docs,refactor,chore}[(scope)]: <concise message>`.
- Never push. Commits are local unless the user asks for a push.
- Never commit on your own initiative — finish the work, recommend a message, and let the user commit. The exception is an explicit commit instruction in that turn.
- Always close a finished piece of work with a recommended commit title in chat, even when you did not commit. Use the format above, keep it one line, and list the changed paths under it.

Never run: `git reset --hard`, `git checkout .`, `git clean -fd`, `git stash`, `git commit --no-verify`, `git push --force`.

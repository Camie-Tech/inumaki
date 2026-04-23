# Contributing to Inumaki AI

This is an internal project. These guidelines keep contributions clean and the codebase healthy.

## Workflow

1. Branch from `dev` (never directly from `main`)
2. Name your branch: `feature/what-it-does`, `fix/what-it-fixes`, `chore/what-it-updates`
3. Keep PRs focused — one thing per PR
4. Fill out the PR template
5. Get at least one review before merging to `dev`
6. Only maintainers merge `dev → main`

## Before opening a PR

```bash
pnpm typecheck   # must pass
pnpm lint        # must pass
pnpm build:web   # must succeed
```

Manually verify the relevant test flow from `docs/test-flows.md`.

## Code conventions

- TypeScript strict mode — no `any` unless absolutely necessary and commented
- Shared types live in `packages/shared` — don't duplicate them
- API routes validate input with Zod
- Don't store raw audio. Don't store transcript history unless explicitly needed.
- Keep components small. Extract hooks for logic.

## Commit messages

```
feat: add coding-prompt output mode
fix: prevent double-paste on hotkey release
chore: update openai sdk to 4.x
docs: add test flow for preview modal
```

## Adding a new output mode

1. Add the mode to `OutputMode` in `packages/shared/src/index.ts`
2. Add a system prompt in `apps/web/src/lib/openai.ts`
3. Add the label/icon to `ModeSelector.tsx` in the desktop renderer
4. Update the Prisma enum in `schema.prisma` + run `pnpm db:push`
5. Add a test flow entry to `docs/test-flows.md`

## Questions

Open an issue or ping the team.

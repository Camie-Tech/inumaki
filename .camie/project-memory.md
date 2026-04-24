# inumaki Project Memory

This file is the durable working memory for Camie Dev Console sessions in this repository.
It was auto-generated from a first-pass repository scan and should be refined as the project evolves.

## Product Overview
- > **Open-source, Windows-first internal voice productivity tool.**
- > Press a hotkey → speak → get polished text pasted into any app.
- ![Status](https://img.shields.io/badge/status-MVP-violet)
- TypeScript codebase

## Architecture
- Monorepo with `apps/web` (Next.js App Router auth/backend/web UI), `apps/desktop` (Electron + Vite React), and `packages/shared` (shared TS types).
- Web auth uses NextAuth v5 beta with DrizzleAdapter, PostgreSQL via `postgres-js`, Google OAuth, SMTP/Nodemailer magic links, database sessions, and invite/domain allowlisting.

## Commands
- `dev`: `pnpm run dev:web`
- `lint`: `pnpm -r lint`
- `test`: `pnpm -r test`
- `typecheck`: `pnpm -r typecheck`
- `dev:web`: `pnpm --filter @inumaki/web dev`
- `dev:desktop`: `pnpm --filter @inumaki/desktop dev`
- `build:web`: `pnpm --filter @inumaki/web build`
- `build:desktop`: `pnpm --filter @inumaki/desktop build`
- Web DB schema push: `pnpm --filter @inumaki/web db:push`

## Conventions
- Package name is `inumaki-ai`.
- Prefer TypeScript-aware changes and keep typecheck healthy.
- Web persistence is Drizzle/PostgreSQL; treat README/docs mentions of Prisma as stale unless code changes.

## Important Files
- Start inspection with `README.md`.
- Start inspection with `package.json`.

## Known Risks
- Local shell/env values can affect NextAuth and dev startup; ensure `NODE_ENV` is standard, `PORT` is free, `NEXTAUTH_URL`/`AUTH_URL` match the served origin, and `DATABASE_URL` is PostgreSQL, not SQLite/file.
- Auth sign-in is intentionally blocked unless the email matches `ALLOWED_EMAIL_DOMAINS`, `ALLOWED_EMAILS`, or a pending invite, and existing inactive users are rejected.

## Recent Decisions
- Project memory is stored in `.camie/project-memory.md` and is injected into every Camie session start.
- Update this file whenever you learn durable facts that should reduce future re-discovery cost.

## Memory Maintenance Rules
- Keep this file concise, factual, and repo-specific.
- Prefer stable facts over temporary task notes.
- Update this file when you learn something future sessions should know immediately.

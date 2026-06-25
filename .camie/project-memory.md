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
- Current check/build blockers: `packages/shared` has a `typecheck` script but no `tsconfig.json`; desktop `tsconfig.json` uses deprecated `moduleResolution: "node"` under TypeScript 6; web `lint` uses `next lint`. The prior `/auth/signin` `useSearchParams()` build blocker has been fixed with a Suspense wrapper.
- Desktop global-hotkey recording path appears incomplete: main-process `AudioRecorder.stop()` returns `null` and only the renderer `useRecorder` path actually captures audio. `paste-text` currently writes clipboard but does not simulate Ctrl+V.
- README/docs still mention Prisma and Resend in places; active code uses Drizzle/PostgreSQL and SMTP/Nodemailer magic links.
- GitHub has two public repos: `Camie-Tech/inumaki` is the cloud/OpenAI API repo in this checkout, while `Camie-Tech/inumaki-oss` is the local `whisper.cpp` OSS repo. Latest OSS release checked: `v0.1.1`, with bundled Electron API, whisper.cpp binary, and `ggml-base.en.bin`.
- Downloaded and extracted OSS release assets locally under `releases/inumaki-oss/`; runnable unpacked app is `releases/inumaki-oss/Inumaki-AI-0.1.1-win-unpacked/win-unpacked/Inumaki AI.exe`. Verified SHA-256 hashes against GitHub release metadata.
- Inumaki landing page lives in `apps/web/src/app/page.tsx`, public brand PNGs in `apps/web/public/brand`, and resolves latest OSS Windows downloads through `/api/download/latest`.
- LP was redesigned (2026-06) into a premium dark Apple-style marketing page: async server component (no client hooks), CSS-only motion via `ink-*` keyframes in `globals.css`, semantic `<dl>/<ol>/<kbd>`, focus-visible rings, `prefers-reduced-motion` support. Body font is Inter (added in `layout.tsx` as `--font-inter`, wired to `--font-sans`); Orbitron is reserved for the "INUMAKI" wordmark + step numerals, Syne for headings, IBM Plex Mono for labels/keycaps. Palette: bg `#0b0f14`, accent cyan `#00aeef`/`#42caff`, slate text.
- BRAND CAVEAT: the wordmark PNGs (`inumaki-wordmark-*-transparent.png`) have DARK text, so they are invisible on dark backgrounds — render "Inumaki" as live Orbitron text on dark sections instead of using the wordmark image. The icon `inumaki-icon-dark-transparent.png` reads fine on dark.
- `apps/web/next.config.mjs` now pins `turbopack.root` to the monorepo root. This fixes the local `pnpm dev` "Can't resolve 'tailwindcss'" failure caused by Turbopack misdetecting the workspace root (a stray `C:\Users\THIS PC\package-lock.json` parent lockfile). Local dev verified: `pnpm dev` serves `/` HTTP 200 with live `v0.1.1` release data and compiled Tailwind CSS.
- Vercel project `inumaki` under `daniel-lordsons-projects` is linked in `.vercel/project.json`, configured with root directory `apps/web`, and deployed at `https://inumaki-five.vercel.app`. Custom domain `inumaki.camie.tech` is added to Vercel but awaits DNS at Namecheap: `A inumaki.camie.tech 76.76.21.21`.

## Recent Decisions
- Project memory is stored in `.camie/project-memory.md`, which is the canonical durable memory for this top-level T3 project.
- Read this file at the beginning of every Codex session before making Inumaki-specific assumptions.
- Update this file at the end of each substantive turn when durable Inumaki-specific information is learned.

## Memory Maintenance Rules
- Keep this file concise, factual, and repo-specific.
- Prefer stable facts over temporary task notes.
- Update this file when you learn something future sessions should know immediately.

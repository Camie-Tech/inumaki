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
- Desktop global-hotkey recording path WAS broken (main-process `AudioRecorder.stop()` returned `null`; nothing started renderer capture on the hotkey; `paste-text` wrote clipboard but never simulated Ctrl+V) — FIXED 2026-06-26 (commit `b9cda27`). See the "Desktop P0" section below.
- README/docs still mention Prisma and Resend in places; active code uses Drizzle/PostgreSQL and SMTP/Nodemailer magic links.
- GitHub has two public repos: `Camie-Tech/inumaki` is the cloud/OpenAI API repo in this checkout, while `Camie-Tech/inumaki-oss` is the local `whisper.cpp` OSS repo. Latest OSS release checked: `v0.1.1`, with bundled Electron API, whisper.cpp binary, and `ggml-base.en.bin`.
- Downloaded and extracted OSS release assets locally under `releases/inumaki-oss/`; runnable unpacked app is `releases/inumaki-oss/Inumaki-AI-0.1.1-win-unpacked/win-unpacked/Inumaki AI.exe`. Verified SHA-256 hashes against GitHub release metadata.
- Inumaki landing page lives in `apps/web/src/app/page.tsx`, public brand PNGs in `apps/web/public/brand`, and resolves latest OSS Windows downloads through `/api/download/latest`.
- LP was redesigned (2026-06) into a premium dark Apple-style marketing page: async server component (no client hooks), CSS-only motion via `ink-*` keyframes in `globals.css`, semantic `<dl>/<ol>/<kbd>`, focus-visible rings, `prefers-reduced-motion` support. Body font is Inter (added in `layout.tsx` as `--font-inter`, wired to `--font-sans`); Orbitron is reserved for the "INUMAKI" wordmark + step numerals, Syne for headings, IBM Plex Mono for labels/keycaps. Palette: bg `#0b0f14`, accent cyan `#00aeef`/`#42caff`, slate text.
- BRAND CAVEAT: the wordmark PNGs (`inumaki-wordmark-*-transparent.png`) have DARK text, so they are invisible on dark backgrounds — render "Inumaki" as live Orbitron text on dark sections instead of using the wordmark image. The icon `inumaki-icon-dark-transparent.png` reads fine on dark.
- `apps/web/next.config.mjs` now pins `turbopack.root` to the monorepo root. This fixes the local `pnpm dev` "Can't resolve 'tailwindcss'" failure caused by Turbopack misdetecting the workspace root (a stray `C:\Users\THIS PC\package-lock.json` parent lockfile). Local dev verified: `pnpm dev` serves `/` HTTP 200 with live `v0.1.1` release data and compiled Tailwind CSS.
- Vercel project `inumaki` under `daniel-lordsons-projects` is linked in `.vercel/project.json`, configured with root directory `apps/web`, and deployed at `https://inumaki-five.vercel.app`. Custom domain `inumaki.camie.tech` is added/aliased on Vercel but still does NOT resolve via DNS (NXDOMAIN as of 2026-06-25) — awaits Namecheap A record `inumaki.camie.tech -> 76.76.21.21`.
- DEPLOY (2026-06-25): `main` was fast-forwarded to the LP redesign (`e282489`) and the redesign is LIVE in production — `https://inumaki-five.vercel.app` serves the new page with live `v0.1.1` release data.
- IMPORTANT deploy fact: pushing to `main` did NOT auto-trigger a Vercel build (Git auto-deploy is not firing for this project). Deploy manually with `vercel --prod --yes` from the repo root (CLI is authed as `camie-ace`, scope `daniel-lordsons-projects`). `.vercelignore` correctly excludes `releases/` (1.2 GB) so CLI uploads are ~50 KB. Remote build uses pnpm 9.15.9 via corepack and passes typecheck + build (~17s).

## SEO / LP / Roadmap (2026-06-25)
- Canonical site origin centralized in `apps/web/src/lib/site.ts` as `SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://inumaki-five.vercel.app'`. Default is the live Vercel URL so canonical/OG/sitemap/robots resolve to a crawlable host. ACTION when `inumaki.camie.tech` DNS resolves: set `NEXT_PUBLIC_SITE_URL=https://inumaki.camie.tech` in Vercel + 308-redirect the `.vercel.app` host — no code change.
- Technical SEO substrate added (App Router file conventions in `apps/web/src/app/`): `sitemap.ts`, `robots.ts` (disallows `/api/ /admin /dashboard /auth/`), `manifest.ts`, generated `opengraph-image.tsx` + `twitter-image.tsx` (next/og, 1200×630, `#0b0f14`; twitter re-exports OG). `layout.tsx` metadata overhauled: env `metadataBase`, `alternates.canonical`, title template, keyword-forward title/description, Twitter card, robots, applicationName/authors/creator/publisher/category, `viewport.colorScheme:'dark'`. JSON-LD `@graph` (SoftwareApplication + Organization + WebSite + FAQPage) rendered server-side in `page.tsx` from the live release version. noindex on `/auth/*` via new `auth/layout.tsx` and on `admin`/`dashboard` page metadata; `/api/download/latest` sends `X-Robots-Tag: noindex` (stays 302).
- `lib/github-release.ts` gained `INUMAKI_REPO_URL` + `getInumakiRepoStars()` (ISR-cached, fails soft to null) — repo now linked in nav/hero/privacy/footer with a live star chip.
- LP `page.tsx` rewrite (server-component-safe, design system preserved): H1 restructured so the tagline (not the opaque "Inumaki" wordmark) is the visual+SEO hero with a mono descriptor line; "Free" added to eyebrow; download de-risk microcopy + SmartScreen hint + null-asset fallback; secondary CTAs → GitHub; feature grid 3→6 cells; NEW sections — privacy deep-dive (mic→whisper.cpp→clipboard flow + audit-the-code CTA), honest "Inumaki vs cloud dictation (Wispr Flow)" comparison `<table>`, use-cases/personas, FAQ (`<details>`, 12 Q&As = FAQPage JSON-LD source of truth), system requirements, expanded 3-col footer. Over-claims softened to match shipping reality (no live streaming; Ctrl+V paste not yet implemented → "ready to paste"/"on the clipboard").
- Plans written to `docs/SEO-PLAN.md` and `docs/ROADMAP.md`. Roadmap benchmarked vs Wispr Flow; its #1 item is FIX-FIRST P0: the desktop main-process recording path (`AudioRecorder.stop()` returns null) and real Ctrl+V/text injection — do NOT marketing-push the comparison until the core loop reliably lands text at the cursor.
- VERIFIED: `pnpm --filter @inumaki/web typecheck` clean; `next build` exit 0 with `/sitemap.xml /robots.txt /manifest.webmanifest /opengraph-image /twitter-image` registered and `/` static (5m ISR). Dev-server curl confirmed all new sections + endpoints render and `/auth/signin`+`/dashboard` emit `noindex,nofollow`.
- Note: Google deprecated FAQ rich snippets 2026-05-07 — FAQPage JSON-LD kept for users + AI Overviews, not an accordion rich result; rich-result winners here are SoftwareApplication/Organization/WebSite.
- COMMITTED + DEPLOYED 2026-06-26: web SEO/LP work committed as `d2d178b` on `main` and deployed to Vercel prod via `vercel --prod --yes` (deployment READY, aliased to `https://inumaki.camie.tech`; live + verified on `https://inumaki-five.vercel.app`). `main` is ahead of `origin/main` (commits NOT pushed to GitHub; Vercel auto-deploy doesn't fire anyway). `NEXT_PUBLIC_SITE_URL` is unset in Vercel so canonical falls back to the Vercel URL (correct) — set it to `https://inumaki.camie.tech` once DNS resolves.

## Desktop P0 — core dictation loop fixed (2026-06-26, commit `b9cda27`)
- CRITICAL DISTINCTION: this checkout's `apps/desktop` is the CLOUD variant — the renderer (`useRecorder.ts`) posts base64 audio to the web `POST /api/process` (OpenAI-backed); there is NO local whisper.cpp here. The local whisper build is the separate `Camie-Tech/inumaki-oss` repo (not in this checkout). So roadmap item "P0.4 model bundling" applies to inumaki-oss, not here.
- P0.1 recording bridge fixed: the global hotkey never actually started renderer capture (main only sent the unconsumed `recording-state-change`) and `stopRecording()` errored on `AudioRecorder.stop()` returning null (never sent `process-audio`). Fix: `main.startRecording()` now sends a new `start-recording` IPC that `useRecorder` listens for (begins MediaRecorder); `stopRecording()` sends `process-audio` (renderer stops/encodes/POSTs). `AudioRecorder` is now a pure state tracker. New preload bridge `onStartRecording`.
- P0.2/P0.3 paste injection: new `apps/desktop/src/main/windows-input.ts` — `captureForegroundWindow()` (called at record-start) + `pasteText()` which writes the clipboard then simulates Ctrl+V via PowerShell Win32 (`AttachThreadInput`+`SetForegroundWindow`+`SendKeys ^v`) and restores the prior clipboard. Best-effort keystroke over a guaranteed clipboard write (degrades to today's manual-paste behavior). NO native deps added (uses bundled `powershell.exe`). `main.ts` `paste-text` handler now calls it.
- Desktop typecheck/build UNBLOCKED & green (was a long-standing blocker): `tsconfig.json` `ignoreDeprecations: "6.0"`; `store.ts` typed shim for electron-store v11 (node10 can't read its ESM `exports` types); new `src/renderer/src/vite-env.d.ts` (CSS module + `WebkitAppRegion`); `main.tsx` `@ts-ignore` on the relative CSS side-effect import. `pnpm --filter @inumaki/desktop typecheck` → exit 0; `pnpm --filter @inumaki/desktop exec vite build` → exit 0 (renderer + main 405 kB + preload).
- Renderer split note: main (CJS/`__dirname`) and renderer (wants bundler resolution) share one `tsconfig.json`; the relative-CSS `@ts-ignore` is a symptom. Proper future fix = split into `tsconfig.node.json` + `tsconfig.app.json`.

## Desktop v0.1.1 RELEASE (2026-06-26)
- Built + published a Windows test release: https://github.com/Camie-Tech/inumaki/releases/tag/v0.1.1 (assets: `Inumaki AI Setup 0.1.1.exe` installer + `Inumaki AI 0.1.1.exe` portable, ~104 MB each, unsigned → SmartScreen). Build: `pnpm --filter @inumaki/desktop build:win` (electron-builder 26.8.1, electron 41.2.1). electron-builder output dir is now `release/` (gitignored), NOT `dist/`.
- Release-prep fixes (commit `7647ca7`, pushed to `origin/main`): (1) FIXED packaged-renderer white-screen bug — prod now `mainWindow.loadFile(path.join(__dirname,'..','renderer','index.html'))` instead of the old `../../renderer` file:// URL that resolved one dir too high; (2) created `apps/desktop/assets/` (icon.png + tray-icon.png copied from `apps/web/public/brand/inumaki-icon-dark-transparent.png`, 1254² — were MISSING, broke the build + risked a Tray crash); (3) electron-builder `win.icon` = `assets/icon.png` (auto-ICO) + `directories.output: release`; (4) `store.ts` default `apiBase` → `https://inumaki-five.vercel.app` (was a placeholder domain); (5) version 0.1.0→0.1.1 + author/description.
- `origin/main` is now PUSHED and current (commits d2d178b web SEO, b9cda27 desktop P0, 7647ca7 release-prep). The cloud repo (`Camie-Tech/inumaki`) previously had only v0.1.0.
- STILL NOT verified: runtime on-device behavior (text landing in a real app via the global hotkey + mic). The released build is the CLOUD variant — needs sign-in + a working backend `/api/process` (OpenAI key) to complete the loop and trigger auto-paste. The LP download (`/api/download/latest`) points at `inumaki-oss`, NOT this repo, so this v0.1.1 is downloaded directly from the release page, not the landing page.

## Recent Decisions
- Project memory is stored in `.camie/project-memory.md`, which is the canonical durable memory for this top-level T3 project.
- Read this file at the beginning of every Codex session before making Inumaki-specific assumptions.
- Update this file at the end of each substantive turn when durable Inumaki-specific information is learned.

## Memory Maintenance Rules
- Keep this file concise, factual, and repo-specific.
- Prefer stable facts over temporary task notes.
- Update this file when you learn something future sessions should know immediately.

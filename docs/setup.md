# Setup

This project is OSS-only. There is no browser sign-in, no invite system, no admin panel, and no database setup.

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 20+ | Required for web and desktop development |
| pnpm | via Corepack | Use `corepack pnpm ...` if `pnpm` is not on PATH |
| Windows | 10/11 x64 | Required to run the desktop app normally |

## Install

```bash
corepack enable
corepack pnpm install
```

## Environment

Create `.env.local` only if you are running the web processing endpoint:

```env
OPENAI_API_KEY=sk-...
```

No auth, SMTP, OAuth, invite, session, or database environment variables are required.

## Run

Web:

```bash
corepack pnpm --filter @inumaki/web dev
```

Desktop:

```bash
corepack pnpm --filter @inumaki/desktop dev
```

The desktop first-run onboarding stores the API server URL locally. For local development, use `http://localhost:3000` unless the web dev server chooses another port.

## Verify

```bash
corepack pnpm --filter @inumaki/web typecheck
corepack pnpm --filter @inumaki/desktop typecheck
```

For a full local smoke test:

1. Start the web app.
2. Start the desktop app.
3. Complete onboarding.
4. Press `Ctrl+Shift+Space`, speak, release the hotkey.
5. Confirm the cleaned text is copied or pasted into the focused app.

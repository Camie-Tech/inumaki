# Inumaki AI

> **Open-source, Windows-first internal voice productivity tool.**  
> Press a hotkey → speak → get polished text pasted into any app.

![Status](https://img.shields.io/badge/status-MVP-violet)
![Platform](https://img.shields.io/badge/platform-Windows-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## What it does

Inumaki AI is a push-to-talk voice input layer with an AI cleanup layer, built for internal developer use. You hold a global hotkey, speak naturally, and get cleaned-up text pasted directly into whatever app is focused — VS Code, Slack, Notion, Terminal, anything.

**Output modes:**

- **Raw Transcript** — minimal cleanup, verbatim
- **Clean Text** — filler words removed, punctuation fixed
- **Polished Message** — professional communication output
- **Coding Prompt** — structured prompt ready for AI coding assistants

**Access:** invite-only. Only approved email domains or explicitly invited emails can sign in.

---

## Tech stack

| Layer             | Stack                                        |
| ----------------- | -------------------------------------------- |
| Desktop app       | Electron + React + TypeScript                |
| Backend / Auth    | Next.js 14 (App Router)                      |
| Auth providers    | Google Workspace OAuth + Magic Link (Resend) |
| Transcription     | OpenAI Whisper (`whisper-1`)                 |
| Rewrite / Cleanup | OpenAI GPT-4o / GPT-4o-mini                  |
| Database          | PostgreSQL + Prisma ORM                      |
| Monorepo          | pnpm workspaces                              |

---

## Project structure

```
inumaki-ai/
  apps/
    desktop/          # Electron app (Windows)
      src/
        main/         # Main process (hotkey, tray, IPC)
        renderer/     # React UI (panel, settings, preview)
    web/              # Next.js backend + web UI
      src/
        app/
          api/        # /api/process, /api/preferences, /api/admin
          auth/       # Sign-in, verify, error pages
          dashboard/  # Post-auth landing
          admin/      # Admin panel
        lib/          # auth.ts, prisma.ts, openai.ts
      prisma/         # Schema + migrations
  packages/
    shared/           # Shared TypeScript types
  .github/
    workflows/        # CI + Release
  docs/               # Additional documentation
```

---

## Getting started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9
- PostgreSQL database
- OpenAI API key
- Google Cloud OAuth credentials (or Resend API key for magic link only)

### 1. Clone and install

```bash
git clone https://github.com/your-org/inumaki-ai.git
cd inumaki-ai
pnpm install
```

### 2. Configure environment

```bash
cp .env.example apps/web/.env.local
# Edit apps/web/.env.local with your credentials
```

Required variables:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
RESEND_API_KEY=...           # for magic link
OPENAI_API_KEY=sk-...
ALLOWED_EMAIL_DOMAINS=yourcompany.com
```

### 3. Set up the database

```bash
cd apps/web
pnpm db:push        # push schema to DB
# or
pnpm db:migrate     # create migration files
```

### 4. Promote yourself to admin

After first sign-in:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@yourcompany.com';
```

### 5. Run the web backend

```bash
pnpm dev:web
# → http://localhost:3000
```

### 6. Run the desktop app

```bash
pnpm dev:desktop
# Electron window opens
```

---

## Google OAuth setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. For production: add your real domain
6. To restrict to a specific Google Workspace, set `ALLOWED_EMAIL_DOMAINS=yourcompany.com`

---

## Inviting users

**Via admin panel** (`/admin`):

- Sign in as admin
- Enter email → Invite
- User gets added to invite list and can sign in

**Via environment variable** (no admin panel needed):

```env
ALLOWED_EMAILS=alice@external.com,bob@contractor.dev
```

---

## Branching model

```
main   ← stable, tagged releases
dev    ← active integration
feature/...  ← short-lived, branch from dev
fix/...      ← bug fixes, branch from dev
```

PRs should target `dev`. Milestones merge `dev → main` and get tagged.

---

## CI / CD

- **CI** (`ci.yml`): runs on all PRs — typecheck, lint, build
- **Release** (`release.yml`): triggered on `v*.*.*` tags — builds Windows `.exe`, creates GitHub release

To cut a release:

```bash
git tag v0.1.0
git push origin v0.1.0
```

---

## Desktop app: connecting to backend

1. Run or deploy the web backend
2. Open the Electron app → Auth screen
3. Enter the API server URL + your work email
4. Browser opens for sign-in (Google or magic link)
5. Copy session token from dashboard → paste into desktop app

---

## Definition of done (MVP)

- [x] Internal users can authenticate (Google + magic link)
- [x] Windows app runs in background/tray
- [x] Global hotkey push-to-talk works
- [x] Audio transcribed via OpenAI Whisper
- [x] 4 rewrite modes (raw, clean, polished, coding prompt)
- [x] Output pastes into focused app
- [x] Preview modal with edit-before-paste
- [x] Settings persisted locally
- [x] Admin panel: invite + deactivate users
- [x] GitHub repo, branch model, CI/CD in place

---

## License

MIT — see [LICENSE](./LICENSE)

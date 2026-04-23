# Architecture

## Overview

Inumaki AI is a two-component system:

```
┌─────────────────────────────────────────────────────────┐
│                   Windows Desktop App                    │
│                 (Electron + React + TS)                  │
│                                                          │
│  ┌──────────┐  ┌─────────────┐  ┌────────────────────┐  │
│  │  Tray    │  │ Main Panel  │  │  Settings Panel    │  │
│  │  + Icon  │  │  (dictate)  │  │  (prefs, hotkey)   │  │
│  └──────────┘  └─────────────┘  └────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │              Main Process (Node.js)              │    │
│  │  globalShortcut · Tray · IPC · electron-store   │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────┬───────────────────────────┘
                              │ HTTPS (REST API)
                              │ POST /api/process
                              │ GET/PATCH /api/preferences
                              │ POST /api/admin
                              ▼
┌─────────────────────────────────────────────────────────┐
│                   Backend (Next.js)                      │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  NextAuth v5  │  │  /api/process│  │  /api/admin  │   │
│  │  Google +     │  │  Whisper +   │  │  Invite /    │   │
│  │  Magic Link   │  │  GPT-4o      │  │  Deactivate  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │                   Prisma ORM                     │    │
│  └──────────────────────────┬─────────────────────┘     │
└───────────────────────────┬─┴───────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │     PostgreSQL         │
                │  users                │
                │  user_preferences     │
                │  usage_logs           │
                │  invites              │
                │  (NextAuth tables)    │
                └───────────────────────┘
                            │
                ┌───────────┴──────────────┐
                │       OpenAI API         │
                │  whisper-1 (transcribe)  │
                │  gpt-4o-mini (raw/clean) │
                │  gpt-4o (polished/code)  │
                └──────────────────────────┘
```

---

## Recording flow

```
User holds hotkey
       │
       ▼
Main process signals renderer (IPC)
       │
       ▼
renderer: MediaRecorder.start()
  └── chunks accumulated every 100ms
       │
User releases hotkey
       │
       ▼
Main process signals renderer: stop
       │
       ▼
renderer: MediaRecorder.stop()
  └── chunks → Blob → ArrayBuffer → base64
       │
       ▼
POST /api/process {audioBase64, mimeType, durationSeconds, mode}
       │
       ▼
Backend: Buffer.from(base64) → OpenAI File
       │
       ▼
Whisper API → transcript (string)
       │
       ▼
GPT-4o (mode-specific system prompt) → rewritten output
       │
       ▼
Response: {transcript, output, mode}
       │
       ▼
renderer receives result
  ├── previewBeforePaste=true  → PreviewModal (editable)
  └── autoPaste=true          → electronAPI.pasteText(output)
                                  └── clipboard.writeText() + simulate Ctrl+V
```

---

## Auth flow (desktop)

```
User enters API URL + email
       │
       ▼
Browser opens: /auth/signin?desktop=1
       │
       ▼
Google OAuth or Magic Link
       │
       ▼
NextAuth creates session in DB
       │
       ▼
Dashboard shows session token
       │
       ▼
User copies token → pastes into desktop app
       │
       ▼
Desktop: fetch /api/auth/session validates token
       │
       ▼
Token stored in electron-store (encrypted if STORE_ENCRYPTION_KEY set)
       │
       ▼
All API calls: Authorization: Bearer <token>
```

---

## Access control layers

```
1. Email allowlist check (NextAuth signIn callback)
   └── ALLOWED_EMAIL_DOMAINS or ALLOWED_EMAILS env var

2. Invite check (if not on allowlist)
   └── invites table, status = PENDING

3. isActive flag
   └── Admin can deactivate any user

4. Role check (admin routes)
   └── /api/admin + /admin page require role = ADMIN

5. Session validation on every API call
   └── auth() call at top of every route handler
```

---

## Data retention policy

- **Raw audio:** never stored
- **Transcripts:** never stored
- **Usage logs:** stored with mode, duration, success flag — no content
- **Preferences:** stored per user, user-editable
- **Sessions:** stored in DB by NextAuth, expire per NextAuth config

---

## Adding a new output mode

1. `packages/shared/src/index.ts` — add to `OutputMode` union
2. `packages/shared/src/index.ts` — add to `OUTPUT_MODE_LABELS`
3. `apps/web/src/lib/openai.ts` — add system prompt to `SYSTEM_PROMPTS`
4. `apps/web/prisma/schema.prisma` — add to `OutputMode` enum
5. `apps/web` — run `pnpm db:push`
6. `apps/desktop/src/renderer/src/components/ModeSelector.tsx` — add icon + label
7. `docs/test-flows.md` — add test flow

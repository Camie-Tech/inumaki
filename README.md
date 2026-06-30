# Inumaki

Open-source, Windows-first voice-to-text. Press a hotkey, speak in any app, and get cleaned text pasted back where you were working.

Inumaki OSS does not require accounts, invite lists, admin panels, browser sign-in, or database-backed sessions.

## Apps

| Workspace | Purpose |
| --- | --- |
| `apps/desktop` | Electron + Vite Windows tray app |
| `apps/web` | Next.js marketing/download site and optional `/api/process` endpoint |
| `packages/shared` | Shared TypeScript request/response types |

## Requirements

- Windows 10 or 11 for the desktop app.
- Node.js 20+ and pnpm via Corepack for development.
- `OPENAI_API_KEY` only if you run the current web `/api/process` backend.

No `DATABASE_URL`, OAuth client, SMTP provider, invite list, or auth secret is required.

## Development

```bash
corepack enable
corepack pnpm install
corepack pnpm --filter @inumaki/web dev
corepack pnpm --filter @inumaki/desktop dev
```

Useful checks:

```bash
corepack pnpm --filter @inumaki/web typecheck
corepack pnpm --filter @inumaki/desktop typecheck
corepack pnpm -r typecheck
```

## Desktop Flow

1. Launch the desktop app.
2. Complete the short first-run onboarding.
3. Press `Windows+Alt` to record.
4. Release the hotkey to process the audio.
5. Inumaki copies or pastes the cleaned text into the focused app.

The desktop settings panel controls mode, tone, hotkey, auto-paste, preview-before-paste, microphone, and API server URL.

## Web API

`POST /api/process` accepts audio from the desktop app without authentication.

Request shape is defined in `packages/shared`:

```ts
{
  audioBase64: string;
  mimeType?: string;
  durationSeconds: number;
  mode?: 'raw' | 'clean' | 'polished' | 'coding_prompt';
  tonePreference?: string;
}
```

Response:

```ts
{
  transcript: string;
  output: string;
  mode: string;
}
```

## Build

```bash
corepack pnpm --filter @inumaki/web build
corepack pnpm --filter @inumaki/desktop build:win
```

Windows installers are produced by `electron-builder` under `apps/desktop/release/`.

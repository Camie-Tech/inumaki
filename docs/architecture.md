# Architecture

Inumaki is a small monorepo with a Windows desktop app, a Next.js web app, and shared TypeScript types.

## Workspaces

| Workspace | Role |
| --- | --- |
| `apps/desktop` | Electron shell, tray window, global hotkey, microphone capture, clipboard/paste integration |
| `apps/web` | Landing/help pages, release download redirect, optional `/api/process` audio endpoint |
| `packages/shared` | Shared request/response types and output mode definitions |

## Runtime Flow

```text
focused Windows app
  -> global hotkey
  -> Electron main process
  -> renderer MediaRecorder
  -> POST /api/process
  -> transcription + rewrite
  -> clipboard / paste into focused app
```

There is no auth boundary in this flow. The desktop app stores local settings through `electron-store`, including onboarding completion, output preferences, hotkey, and API base URL.

## Desktop

Key files:

- `apps/desktop/src/main/main.ts`: Electron lifecycle, tray/window, global hotkey IPC.
- `apps/desktop/src/main/windows-input.ts`: foreground-window capture and paste simulation.
- `apps/desktop/src/renderer/src/App.tsx`: first-run onboarding and main/settings navigation.
- `apps/desktop/src/renderer/src/hooks/useRecorder.ts`: microphone capture and `/api/process` request.
- `apps/desktop/src/renderer/src/pages/OnboardingPanel.tsx`: no-account first-run setup.

## Web

Key files:

- `apps/web/src/app/page.tsx`: landing page.
- `apps/web/src/app/help/page.tsx`: install and troubleshooting guide.
- `apps/web/src/app/api/process/route.ts`: unauthenticated processing endpoint.
- `apps/web/src/lib/openai.ts`: OpenAI transcription and rewrite calls for the current API path.
- `apps/web/src/lib/github-release.ts`: release metadata and download URL helpers.

## Removed Auth/DB Surface

The OSS app does not include:

- NextAuth routes or providers.
- Google OAuth or magic-link email.
- Invite allowlists.
- Admin user management.
- PostgreSQL session/user tables.
- Desktop browser handoff tokens.

`/auth/*` routes that remain are informational no-account pages or redirects so stale links fail gracefully.

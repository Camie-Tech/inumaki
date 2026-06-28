# Test Flows

These flows reflect the OSS-only app. Do not add browser sign-in, invite, admin, or database checks.

## Flow 1: Desktop First Run

1. Start the desktop app with a clean local store.
2. Confirm the first-run onboarding appears.
3. Set the API server URL.
4. Continue to the main panel.

Pass: no browser opens and no auth token is requested.

## Flow 2: Hotkey Recording

1. Focus a text editor.
2. Press `Ctrl+Shift+Space`.
3. Speak a short sentence.
4. Release the hotkey.

Pass: recording starts and stops through the global hotkey, audio is sent to `/api/process`, and the result is copied or pasted.

## Flow 3: Manual Record Button

1. Open the desktop main panel.
2. Click the record button.
3. Speak a short sentence.
4. Click stop.

Pass: the same processing path runs without requiring a session.

## Flow 4: Preview Before Paste

1. Enable preview-before-paste in Settings.
2. Record a short sentence.

Pass: the preview modal appears with transcript and cleaned output.

## Flow 5: Settings Persistence

1. Change default mode, tone, hotkey, auto-paste, preview-before-paste, and API server URL.
2. Save settings.
3. Restart the desktop app.

Pass: settings reload from local storage.

## Flow 6: Web Dashboard

1. Open `/dashboard`.

Pass: the public getting-started dashboard renders. It does not redirect to `/auth/signin`.

## Flow 7: Stale Auth Links

1. Open `/auth/signin`.
2. Open `/auth/verify`.
3. Open `/auth/desktop`.

Pass: sign-in and verify explain that no account is required; desktop auth redirects to `/dashboard`.

## Flow 8: Processing Endpoint

1. Send a valid `POST /api/process` request with audio data.
2. Omit all auth headers.

Pass: the endpoint processes the request or returns a processing error, never `401 Unauthorized`.

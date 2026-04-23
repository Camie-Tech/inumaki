# Manual Test Flows

Run these manually before any release or milestone merge into `main`.

---

## Flow 1 — Sign in (Google)

1. Open app at `http://localhost:3000`
2. Click **Continue with Google Workspace**
3. Authenticate with an approved account
4. Confirm landing on `/dashboard`

**Pass:** User is signed in, dashboard shows stats.  
**Fail:** Redirect loop, blank page, or error screen.

---

## Flow 2 — Sign in (Magic Link)

1. Open `/auth/signin`
2. Enter approved email → **Continue with Email**
3. Check inbox for link
4. Click link → confirm `/dashboard` loads

**Pass:** Session established.  
**Fail:** Email not received, link expired immediately, unauthorized error.

---

## Flow 3 — Blocked email

1. Try signing in with an email NOT in `ALLOWED_EMAIL_DOMAINS` or `ALLOWED_EMAILS` and NOT invited
2. Confirm redirect to `/auth/error?error=AccessDenied`

**Pass:** Clear "Access denied" message.  
**Fail:** User gets in, or unhandled error.

---

## Flow 4 — Desktop auth

1. Open Electron app → Auth panel
2. Enter API server URL + work email
3. Click **Sign in with Browser** → browser opens
4. Sign in via browser → copy session token from dashboard
5. Paste token → **Connect**

**Pass:** App transitions to Main Panel.  
**Fail:** Token rejected, blank state, crash.

---

## Flow 5 — Basic dictation (Clean mode)

1. Open any text field (Notepad, VS Code, browser input)
2. Press `Ctrl+Shift+Space`
3. Speak: _"uh so basically I want to um add a new button to the settings page"_
4. Press `Ctrl+Shift+Space` again to stop

**Pass:**

- Recording animation shows
- Processing state shows
- Output: _"I want to add a new button to the settings page."_
- Text pastes into focused app

**Fail:** No waveform, no output, paste doesn't land, filler words not removed.

---

## Flow 6 — Raw mode

1. Set mode to **Raw Transcript**
2. Speak: _"um yeah so we should probably like fix the bug in uh the API handler"_
3. Stop

**Pass:** Transcript is near-verbatim, minimal rewriting.  
**Fail:** Output is over-cleaned or equivalent to Clean mode.

---

## Flow 7 — Polished Message mode

1. Set mode to **Polished Message**
2. Speak informally: _"hey just wanted to say the deploy went fine and like everything is working now"_
3. Stop

**Pass:** Output is a professional, concise message. E.g. _"The deployment completed successfully. Everything is working as expected."_  
**Fail:** Casual language preserved, padding added, meaning changed.

---

## Flow 8 — Coding Prompt mode

1. Set mode to **Coding Prompt**
2. Speak: _"I need a function that takes a list of users and returns only the ones that are active and have logged in in the last 30 days sorted by most recent login"_
3. Stop

**Pass:** Output is structured with clear task description and bullet-point requirements.  
**Fail:** Output is a cleaned sentence, not a structured prompt.

---

## Flow 9 — Preview before paste

1. Settings → enable **Preview before paste**
2. Speak anything
3. Stop

**Pass:**

- Preview modal opens with transcript + rewritten output
- Text is editable
- **Paste** button works, pastes edited text
- **Cancel** dismisses without pasting

**Fail:** Modal doesn't open, edits not preserved, paste inserts unedited text.

---

## Flow 10 — Auto-paste off

1. Settings → disable **Auto-paste**
2. Speak something
3. Stop

**Pass:** Output shown, notification says "copied to clipboard", nothing auto-pasted.  
**Fail:** Text pastes anyway.

---

## Flow 11 — Microphone change

1. Settings → switch microphone to a different input device
2. Save → speak

**Pass:** Recording uses selected device, audio captured correctly.  
**Fail:** Silent audio, wrong device used, crash.

---

## Flow 12 — Hotkey change

1. Settings → change hotkey to `Ctrl+Alt+Space`
2. Save
3. Use new hotkey to trigger recording

**Pass:** Old hotkey no longer works, new hotkey triggers correctly.  
**Fail:** Both hotkeys work, neither works, app freezes.

---

## Flow 13 — Error: microphone denied

1. Deny microphone permission in OS/browser settings
2. Try to record

**Pass:** Clear error message in UI ("Microphone access denied"), no crash, retry path available.  
**Fail:** Silent failure, crash, infinite processing state.

---

## Flow 14 — Error: network down

1. Stop the backend server (`Ctrl+C` in terminal)
2. Try to dictate

**Pass:** Error state shown after timeout, message indicates connection issue, retry button works when server is back.  
**Fail:** Indefinite processing spinner, crash.

---

## Flow 15 — Tray behavior

1. Close the main window (X button)
2. Confirm app still runs in system tray
3. Click tray icon → window reappears
4. Right-click tray → **Quit**

**Pass:** App persists in tray, quit fully exits.  
**Fail:** App exits on window close, tray icon missing, quit doesn't work.

---

## Flow 16 — Admin: invite user

1. Sign in as admin → `/admin`
2. Enter a new email → **Invite**
3. Sign out → sign in as that email

**Pass:** Invited user can sign in.  
**Fail:** Invite not created, user still blocked.

---

## Flow 17 — Admin: deactivate user

1. Sign in as admin → `/admin`
2. Find a user → **Deactivate**
3. Sign out → sign in as that user

**Pass:** Deactivated user sees access denied.  
**Fail:** User still signs in, or admin page errors.

---

## Flow 18 — Usage logging

1. Complete any dictation successfully
2. Check `/dashboard` → recent activity table

**Pass:** Log entry appears with correct mode, duration, success status.  
**Fail:** No log, wrong mode recorded, duration is 0.

---

## Flow 19 — Settings persistence

1. Change mode, tone, hotkey
2. Save → close and reopen app

**Pass:** All settings restored to saved values.  
**Fail:** Settings reset to defaults on restart.

---

## Flow 20 — Second instance

1. Launch Inumaki AI
2. Try launching a second instance

**Pass:** Second launch focuses the existing window, no duplicate process.  
**Fail:** Two instances run simultaneously.

# Inumaki — Product Features & Roadmap Plan

**Owner:** Product, Camie Tech
**Product:** Inumaki (`inumaki-ai`) — local-first voice-to-text for Windows
**Date:** 2026-06-25
**Benchmark:** Wispr Flow (wisprflow.ai)

---

## 1. Product Vision & Positioning

**Inumaki is the local-first, private, open-source, free answer to Wispr Flow: press a hotkey, speak in any Windows app, and clean text lands at your cursor — with audio that never leaves your machine.** Where Wispr Flow is a cloud-processed "AI writing OS" that ships your nearby text, proper nouns, and app metadata to its servers by default, gates the real product behind ~$15/mo, throttles its free tier to ~2,000 words/week, and requires an account even to start, Inumaki runs 100% on-device via bundled whisper.cpp, is MIT-licensed and auditable, and is free and unlimited forever with no login. **The wedge: own the underserved "trustworthy, Windows-native, provably-offline dictation that just works" lane** — the exact segment Wispr structurally cannot serve (legal, healthcare, government, finance, air-gapped, travelers, poor-connectivity) and that cross-platform OSS rivals (Handy, Whispering, OpenWhispr) treat as a second-class port. We do not chase Wispr up-market into teams/analytics/100-language breadth; we win on **privacy you can verify, price you can't beat, and a Windows core loop that is bulletproof.**

Positioning line for every surface: **"100% on-device. Your audio never leaves your computer. Open-source, MIT, auditable. Free forever. Works with WiFi off."**

---

## 2. Competitive Gap Analysis

Honest parity matrix. "Inumaki (today)" reflects shipped v0.1.1 plus the known-broken paths from repo memory.

| Dimension | Inumaki (today) | Wispr Flow | OSS field (Handy / Whispering / VoiceInk) |
|---|---|---|---|
| **Core loop (hotkey → speak → paste)** | ⚠️ **Broken** — main-process recording returns null; paste writes clipboard but never simulates Ctrl+V | ✅ Rock-solid, system-wide | ✅ Works; reliable on Win |
| **Transcription engine** | ggml-base.en only (bundled) | Cloud AI models + post-edit | ✅ Model picker (Whisper S/M/Turbo/Large, Parakeet, Moonshine) |
| **Accuracy out-of-box** | ⚠️ base.en weak vs larger models | ✅ High | ✅ turbo/Parakeet competitive |
| **Streaming / partial results** | ❌ Chunk-at-end | ⚠️ Fast cloud round-trip | ❌ Mostly chunk |
| **VAD / silence handling** | ❌ None | ✅ | ⚠️ Some |
| **AI cleanup / auto-edit** | ❌ Raw output | ✅ Auto Cleanup, filler removal, formatting | ⚠️ Optional LLM (Ollama/BYOK) |
| **Custom vocabulary / dictionary** | ❌ | ✅ Personal + shared + auto-learning | ✅ VoiceInk/Superwhisper |
| **Snippets / voice shortcuts** | ❌ | ✅ | ⚠️ Partial |
| **Command mode (edit selected text)** | ❌ | ✅ Pro-gated | ❌ Rare |
| **Per-app profiles** | ❌ | ✅ Tone-by-app | ✅ VoiceInk Power Mode |
| **Languages** | English only (honest) | ✅ 100+ (uneven) | ✅ Multilingual via model |
| **Platforms** | Windows x64 only | Mac / Win / iOS / Android | ✅ Cross-platform |
| **Configurable hotkey / PTT + toggle** | ❌ One hardcoded `Ctrl+Shift+Space` | ✅ Up to 4 bindings, PTT + hands-free | ✅ Configurable |
| **Status HUD / listening indicator** | ❌ | ✅ Flow Bar | ✅ Status pill |
| **History / re-insert** | ❌ | ⚠️ Scratchpad | ⚠️ Some |
| **Auto-update + code signing** | ❌ Unsigned → SmartScreen | ✅ Signed | ⚠️ Mixed |
| **Onboarding** | Minimal | ✅ ~1-min | ⚠️ Varies |
| **Privacy (audio/context off device)** | ✅ **100% local, no account** | ❌ Cloud; context sent by default | ✅ Local-first |
| **Open-source / auditable** | ✅ **MIT, public repo** | ❌ Closed | ✅ Mostly MIT/GPL |
| **Price** | ✅ **Free, unlimited** | ❌ ~$15/mo; 2k words/wk free cap | ✅ Free / one-time |

**The honest read:** Inumaki is **behind on nearly every functional row and ahead on exactly the three rows that matter strategically** (privacy, open-source, price). Worse, the core loop is currently broken — a Wispr refugee who downloads today may find text doesn't paste. **We cannot market the comparison until §3 is fixed.**

---

## 3. FIX-FIRST (P0) — correctness gaps that block the core promise

These are not roadmap items; they are the product. Nothing in §4 ships until these are done. **This is the entire content of the next push (v0.1.2).**

### P0.1 — Fix the main-process recording path
- **Problem:** `AudioRecorder.stop()` returns null; only the renderer's `useRecorder` actually captures. The global hotkey must record regardless of which app has focus.
- **Fix:** Make recording reliable and focus-independent in the main process (or a dedicated hidden renderer driven by main). Start on hotkey-down, return real audio buffers on stop, every time.
- **Effort: M** · *Privacy:* audio stays in memory; temp only if whisper.cpp requires, deleted immediately; never persisted by default.

### P0.2 — Real text injection (the Ctrl+V problem)
- **Problem:** We write the clipboard but never paste.
- **Fix:** (1) Default: clipboard + Win32 `SendInput` Ctrl+V. (2) **Save/restore prior clipboard.** (3) **Fallback:** type character-by-character via `SendInput` (Unicode) for paste-blocked fields (login screens, some IDEs) — this actually **beats** naive rivals.
- **Effort: S–M** · *Privacy:* local OS APIs only.

### P0.3 — Focus handling
- Capture the foreground window/control at hotkey-press; restore/target it on paste. HUD windows must be no-activate (`WS_EX_NOACTIVATE`). **Effort: S–M.**

### P0.4 — Model bundling & load reliability
- Verify model presence + checksum on launch; clear error + recovery if missing/corrupt; pin the whisper.cpp/ggml version; lay groundwork for on-demand model download. **Effort: S.**

**Exit criteria for P0 (ship as v0.1.2):** Press `Ctrl+Shift+Space` in Notepad, Word, Chrome, VS Code, and Slack → speak → clean text reliably appears at the cursor, prior clipboard intact, in ≥99% of attempts. **Until this passes, do not market against Wispr.**

---

## 4. Roadmap by horizon

### NOW — v0.2 ("rock-solid core loop + first differentiators") · 4–8 weeks
| Feature | User value | vs Wispr Flow | Effort | Privacy / local-first notes |
|---|---|---|---|---|
| **Configurable hotkey + PTT *and* toggle** | Rebind from Settings; hold-to-talk or tap-to-toggle | Wispr allows 4 bindings + PTT; we have one hardcoded | S | Local setting only |
| **Model picker w/ on-demand download** (large-v3-turbo, distil-whisper, Parakeet, Moonshine) | Big accuracy/speed jump over base.en | Wispr hides models in cloud; we give control | M | Models downloaded once, then fully offline; show a "downloading model" step, never silent |
| **VAD (Silero)** | Trims dead air, cuts latency, suppresses silence-hallucinations | Wispr does this server-side; we do it locally | S–M | Bundled, on-device |
| **Custom vocabulary / replacements** | Fix proper nouns, names, jargon, code terms | We give personal dict free + local | S–M | Local file; whisper.cpp `initial_prompt` bias + post-replacement map |
| **Dictation history + re-insert** | Safety net when paste lands wrong | Wispr Scratchpad-adjacent | S–M | Local; off or auto-pruned by default, user-clearable |
| **Floating status HUD** (listening/processing) | Trust that it's recording | Matches Wispr's Flow Bar | S | No-activate window; doubles as a privacy signal |
| **First-run onboarding (no account)** | <1-min setup; lead with "no login, works offline" | Beats Wispr's account-required start | S | "No account, no telemetry, audio stays local" on first launch |

### NEXT — v0.3–0.5 ("polished, signed, trustworthy, differentiated") · this quarter
| Feature | User value | vs Wispr Flow | Effort | Privacy / local-first notes |
|---|---|---|---|---|
| **Optional LLM post-processing** (filler removal, format modes: email/commit/bullets) | Polished text from rambled speech | Answers Wispr's Auto Cleanup, **but private** | M | **Defaults to local via Ollama.** BYO-key is an explicit opt-in. Never on by default if it sends data off device. |
| **Filler-word removal + casing (rules-based)** | Clean output without an LLM | Wispr's filler strip, fully on-device | S | 100% local rules pass — the safe default |
| **Per-app profiles** | Code editor vs email get different treatment | Matches VoiceInk Power Mode / Wispr tone-by-app | M–L | Per-app config stored locally |
| **Partial / streaming results** | Words appear while speaking — *feels* 2× faster | Aqua's ~850ms streaming is the bar | L | Fully local; biggest UX lever after correctness |
| **Snippets / voice shortcuts** | Trigger phrase → boilerplate | Matches Wispr snippets, free + local | S | Local file |
| **Code signing (EV cert) + `electron-updater` auto-update** | No SmartScreen scare; seamless updates | Wispr is signed; unsigned warnings crush our funnel | M | Settle the cert before shipping auto-update; real ops cost, non-negotiable |
| **"Provably-offline" trust framing + network-block self-test** | One-click proof of zero network calls | The one thing Wispr/Aqua structurally cannot claim | S | Self-test asserts no outbound sockets during dictation |

### LATER — v1.0+ ("expand the lane")
| Feature | User value | vs Wispr Flow | Effort | Notes |
|---|---|---|---|---|
| **Multilingual models** | Beyond English via Whisper turbo/large | Wispr claims 100+ but quality is uneven — ship excellent English first, add languages honestly | M–L | Never over-promise a half-working 100-language claim |
| **macOS support** | Doubles TAM; Electron makes it feasible | Reaches Wispr's home turf | L | Same local-first guarantees; AX permission model |
| **Command mode** (select text → "shorten/translate/bulletize") | Dictation → voice editing | Wispr's Pro-gated frontier; ours free + local LLM | L | Local LLM default; opt-in BYO-key |
| **Auto-learning dictionary** | Learns from typed-over corrections | Wispr's standout learning feature | M | Learning stays local |
| **Local-only context-awareness** (proper nouns from focused window) | Coding/proper-noun accuracy | Aqua/Wispr do this **via cloud**; we do it **on-device** — uniquely defensible | L | On-device only, off by default, explicit opt-in. Most directly inverts Wispr's trust scandal |
| **Code-vs-prose formatting awareness** | No auto-cap/punct of identifiers in editors | Wins the dev audience we're positioned for | M | Local |
| **CLI flags / signals** (`--toggle`, `--cancel`) | Scriptable control | Beyond Wispr; turns users into power users | S | Local |
| **Linux support** | Completes cross-platform | Wispr has **no Linux** — underserved | M–L | Local-first |
| **Accessibility (UI Automation / TextPattern) insertion** | More reliable insertion for some apps | The "correct" long-term injection path (Talon/Voice Access use it) | L | Local OS APIs |

---

## 5. Monetization & sustainability (without compromising the free/local core)

**Inviolable:** the core app stays MIT, free, unlimited, offline, no-account, no-telemetry. Monetization wraps *around* that, never inside it.

1. **GitHub Sponsors / donations — start now** (Handy model). Zero friction; signals seriousness.
2. **One-time "Pro" license (~$30–40, VoiceInk model).** OSS code stays free to build; a paid signed binary + license unlocks *convenience* Pro features (advanced per-app profiles, auto-learning dictionary, command-mode bundle). Pro features must be conveniences, never gates on the core loop.
3. **BYOK API option as a bridge** (Whispering/OpenWhispr model). Let power users plug in their own Groq/OpenAI key for speed without adding hosted accounts, sessions, or team administration.
4. **Local-first sync only if needed.** If profiles/dictionaries need portability later, prefer file import/export or user-owned sync targets. Do not add a hosted/internal account mode.

**Do NOT:** require login, add telemetry-by-default, throttle a free tier, or drift up-market into teams/analytics early. Wispr is vacating the simple-private-free single-user lane; that's our entire market.

---

## 6. The single most important thing to do next

**Fix the core loop: make recording focus-independent (P0.1) and ship real Ctrl+V/text injection with clipboard save-restore and a type-out fallback (P0.2), gated by the §3 exit criteria.**

Every strategic advantage — privacy, open-source, free-forever, offline — is **worthless if a Wispr refugee downloads Inumaki and the text doesn't appear at their cursor.** A core loop that silently fails is not a feature gap; it is the product not existing. The entire comparison narrative against Wispr Flow is only credible the moment dictation reliably lands text in Notepad, Word, Chrome, VS Code, and Slack. **Ship v0.1.2 (P0 only). Then, and only then, start marketing the comparison.**

---

### Sequencing summary
- **v0.1.2 (P0, weeks 0–3):** recording path, paste injection, focus, model load reliability. *Make it real.*
- **v0.2 (weeks 3–8):** hotkey config + PTT/toggle, model picker, VAD, custom dictionary, history, HUD, no-account onboarding. *Make it competitive.*
- **v0.3–0.5 (this quarter):** local LLM cleanup (Ollama default / BYOK opt-in), filler removal, per-app profiles, streaming, code signing + auto-update, offline self-test. *Make it trustworthy and polished.*
- **v1.0+:** multilingual, macOS, command mode, auto-learning dict, local context-awareness, code-vs-prose, CLI, Linux, AX insertion. *Expand the lane we own.*

**One sentence to govern every decision:** if a feature requires sending the user's audio, screen, or context off-device by default, it is the wrong feature — that is precisely the ground Wispr Flow conceded, and it is ours to take.

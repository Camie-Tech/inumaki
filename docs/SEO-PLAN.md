# Inumaki — Definitive SEO Improvement Plan

**Product:** Inumaki (`inumaki-ai`) by Camie Tech — free, open-source, Windows-first, 100% on-device voice-to-text via whisper.cpp (MIT).
**Site:** Next.js 16 App Router single landing page (`apps/web/src/app/page.tsx`), live at `https://inumaki-five.vercel.app`, intended home `https://inumaki.camie.tech` (DNS not resolving as of 2026-06-25).
**Date:** 2026-06-25

> **TIME-SENSITIVE CORRECTION — read first.** The common assumption that "FAQ schema wins featured snippets" is **no longer true.** Google **fully deprecated FAQ rich results on May 7, 2026.** FAQPage markup is still *valid* (no error, no penalty) and is still parsed for AI Overviews / LLM ingestion, but it will **not** render the expandable accordion in Search for any site. **Ship FAQ content for users + AI answer-engines, but do NOT budget effort expecting a Google FAQ rich snippet.** The schema types that still earn rich results — and that we prioritize — are **`SoftwareApplication`**, **`Organization`**, and **`WebSite`**.

Legend: **[NOW]** = implemented in this pass (metadata, sitemap, robots, manifest, OG image, JSON-LD, FAQ section). **[LATER]** = follow-up work (new pages, off-page, ongoing).

---

## 1. Executive summary & the 5 highest-leverage moves

Inumaki is **not** entering a blue-ocean niche. The exact "free / open-source / local / private / Windows / whisper" lane is already contested by **Handy** (`handy.computer`, ~20k stars), **OpenWhispr**, and especially **WritHer** (`getwrither.com`, Windows-only, explicitly "Wispr Flow alternative for Windows"). Inumaki cannot win broad head terms ("voice to text windows," owned by Microsoft/Dragon/Zapier) in year one. Its leverage is in **differentiated long-tails** built on its only defensible modifiers: **MIT-licensed, bundled-model zero-setup, no account / no API key / no cloud, audit-the-code privacy**, and **comparison/"alternative" queries**.

The site also had a foundational identity problem: `metadataBase` pointed at `https://www.camie.tech` (the parent company, a *different* property), so every relative OG/icon URL resolved to a host that doesn't serve those assets — broken social previews and a canonical pointing at the wrong domain. There was no sitemap, robots, manifest, structured data, Twitter card, or canonical. Fixing this is the precondition for everything else.

**The 5 highest-leverage moves (in order):**

1. **Consolidate domain identity (env-driven canonical).** **[NOW]** Canonical host configurable via `NEXT_PUBLIC_SITE_URL`, defaulting to the live Vercel URL so canonical/OG/sitemap all resolve to a crawlable host today. Add `alternates.canonical: '/'`. This single fix unblocks indexing.
2. **Ship the technical SEO substrate.** **[NOW]** `sitemap.ts`, `robots.ts` (disallow `/api`, `/admin`, `/dashboard`, `/auth`), `manifest.ts`, generated `opengraph-image.tsx`/`twitter-image.tsx` (1200×630), and a Twitter card. Pure upside, no ranking risk.
3. **Add `SoftwareApplication` + `Organization` + `WebSite` JSON-LD**, populated dynamically from the GitHub release already fetched in `page.tsx`. **[NOW]** Biggest rich-result opportunity for a downloadable app; disambiguates "Inumaki" from the Jujutsu Kaisen character.
4. **Attack the "Wispr Flow alternative (free / open-source)" cluster** with a dedicated `/wispr-flow-alternative` comparison page. **[LATER]** Highest-ROI keyword set; the SERP is weak listicles + WritHer, beatable. Paired with the FAQ section shipped now and an on-page comparison teaser.
5. **Run the OSS distribution playbook.** **[LATER]** GitHub repo optimization → alternativeto.net + awesome-lists → coordinated Product Hunt + Show HN launch. For a zero-DA OSS tool, off-page links + community launches drive ~80% of early authority.

---

## 2. Keyword strategy

Intent: **I** = informational, **T** = transactional/commercial, **N** = navigational. Volume/difficulty are **qualitative** SERP-composition estimates (no live volume API was available — validate in GSC/Ahrefs before committing budget). **Leverage** = realistic ranking upside for a zero-DA site.

### Primary (head terms — high volume, very high difficulty; use as *copy context*, not year-one targets)

| Keyword | Intent | Difficulty | Volume | Leverage |
|---|---|---|---|---|
| voice to text windows | T/I | Very high (Microsoft + Zapier + Dragon own SERP) | Very high | Low |
| dictation software windows | T | Very high | High | Low |
| speech to text windows | T/I | Very high | High | Low |
| windows voice typing | I | High (Microsoft owns it) | High | Low |
| free dictation software | T | High | High | Medium |

> Weave these into body copy and headings for relevance/context; do **not** expect to rank them quickly.

### Secondary (mid-tail — the realistic battleground)

| Keyword | Intent | Difficulty | Leverage | Why winnable |
|---|---|---|---|---|
| **open source voice to text windows** | T | Medium | **High** | Inumaki's literal category; few strong incumbents |
| **offline speech to text windows** | T | Medium | **High** | "Audio never leaves the machine" is the exact match |
| **local dictation app** | T | Medium | **High** | On-device is the core mechanic |
| **private voice typing** | T/I | Low-med | **High** | Privacy-buyer intent, weak SERP |
| free voice to text app windows | T | Med-high | Medium | Listicle-dominated but reachable |
| whisper dictation app | T | Medium | High | Niche, tech-aware buyers |
| dictation app no subscription | T | Low-med | **High** | Directly counters Wispr's $15/mo |
| voice typing no internet windows | T | Low | **High** | "Works with WiFi off" claim |
| **whisper.cpp dictation windows** | T | Low | **Very high** | Almost unclaimed |

### Long-tail (highest leverage — attack first)

| Keyword | Intent | Leverage | Notes |
|---|---|---|---|
| **wispr flow alternative free** | T | **Very high** | Dedicated comparison page; WritHer ranks but is beatable |
| **wispr flow open source alternative** | T | **Very high** | Inumaki's exact positioning |
| **free offline dictation app windows** | T | **Very high** | Sharp product page + "vs" page can place |
| **open source whisper dictation windows** | T | **Very high** | Topical depth wins this |
| **MIT licensed dictation app** | T | **Very high** | Almost no competition — Inumaki's truly unique modifier |
| **no cloud dictation windows** / audio stays on device | T/I | **High** | Privacy intent |
| **push to talk dictation windows free** | T | **High** | Matches the hotkey mechanic |
| **dictate into any windows app hotkey** | I | **High** | Mirrors the product flow + H1 |
| **how to dictate text in any windows app without internet** | I | **High** | FAQ/blog target → AI Overviews |
| **superwhisper alternative windows free** | T | High | Secondary "alternative" target |

**The cluster to attack first:** `wispr flow alternative (free / open source)` + `free offline / open-source whisper dictation windows` + `MIT-licensed / no-account / audio-stays-on-device`. These map 1:1 to Inumaki's only defensible differentiators and have weak, beatable SERPs.

---

## 3. On-page SEO

### Final `<title>` — **[NOW, shipped]**
```
Inumaki — Free Local Voice-to-Text for Windows
```
Implemented as a **template** so future pages inherit branding:
```ts
title: {
  default: 'Inumaki — Free Local Voice-to-Text for Windows',
  template: '%s · Inumaki',
}
```

### Final `<meta description>` — **[NOW, shipped]**
```
Free, open-source voice-to-text for Windows. Press Ctrl+Shift+Space, speak in any app, and paste clean text. 100% local transcription via whisper.cpp — your audio never leaves your PC.
```

### Heading hierarchy fix — **[NOW, shipped]**
**Problem:** the old H1 led with the brand token **"Inumaki"** (zero keyword); the keyword-bearing line was secondary.
**Fix shipped:** "Inumaki" demoted to a small Orbitron eyebrow; the keyword line "Press a key. Speak. Paste clean text anywhere." is the dominant H1 text, followed by a mono descriptor "Local voice-to-text for Windows · whisper.cpp on-device" — all inside one `<h1>`. The lead paragraph now says "free, open-source voice-to-text app for Windows."

### Internal content sections — **[NOW]** (FAQ, comparison, privacy, use-cases shipped) / **[LATER]** (dedicated pages)
- **FAQ section (12 Q&As)** — **[NOW]** with matching `FAQPage` JSON-LD. Targets long-tail questions and feeds AI Overviews.
- **"Inumaki vs cloud dictation (Wispr Flow)" comparison** — **[NOW]** honest table on the page; full `/wispr-flow-alternative` page **[LATER]**.
- **Privacy / "how local transcription works"** — **[NOW]** the category wedge against Wispr's cloud-only model.
- **Use-cases** (developers/writers/accessibility/privacy teams) — **[NOW]**.

> **Honesty guardrail (load-bearing for SEO):** the desktop main-process recording path is incomplete and paste writes the clipboard but does **not** yet simulate Ctrl+V; it's English-only (`ggml-base.en`), Windows-only, no custom vocabulary. Copy must not claim features that don't ship. Over-promising → install → bounce → ranking loss. The FAQ and comparison are candid (Wispr wins on multilingual/cross-platform/AI auto-edit; Inumaki wins on free/MIT/local/no-account).

---

## 4. Technical SEO — checklist for this Next.js 16 app

### A. Canonical / domain consolidation — **[NOW, shipped]**
**Recommended canonical host: `https://inumaki.camie.tech`** (brand-clean subdomain), but DNS does not resolve yet (2026-06-25).
**Decision — env-driven base (`apps/web/src/lib/site.ts`):** `SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://inumaki-five.vercel.app'`.
- The default is the **live Vercel URL** so canonical/OG/sitemap/robots resolve to a crawlable host even if the env var is unset.
- **When DNS resolves:** set `NEXT_PUBLIC_SITE_URL=https://inumaki.camie.tech` in Vercel and add a **308 redirect** from the `.vercel.app` host to the custom domain — zero code change.
- **Noindex Vercel preview/branch deploys** so ephemeral URLs never compete. **[LATER]**

### B. Metadata API overhaul (`layout.tsx`) — **[NOW, shipped]**
`metadataBase` env-driven + `alternates.canonical: '/'`; `title.template`; keyword-forward `description`; **`twitter` card** (`summary_large_image`); `openGraph.url`/`siteName: 'Inumaki'`/`type: 'website'`; `robots` (index/follow, `max-image-preview: large`, `max-snippet: -1`); `applicationName`, `authors`, `creator`, `publisher`, `category: 'productivity'`, `keywords`; `viewport.colorScheme: 'dark'`.

### C. Metadata route files — **[NOW, shipped]** (`apps/web/src/app/`)
- **`sitemap.ts`** — single `/` entry (`changeFrequency: 'weekly'`, `priority: 1`).
- **`robots.ts`** — allow `/`; disallow `/api/`, `/admin`, `/dashboard`, `/auth/`; declares sitemap + host.
- **`manifest.ts`** — name/short_name/description, `display: 'standalone'`, `#0b0f14` colors, dark icon.
- **`opengraph-image.tsx`** + **`twitter-image.tsx`** — `next/og` `ImageResponse`, 1200×630, `#0b0f14`, wordmark + tagline + "Free · Open source · Local · Windows · whisper.cpp". Replaces the off-spec 1536×1024 dark-text wordmark.

### D. Structured data (JSON-LD `@graph`) — **[NOW, shipped in `page.tsx`]**
1. **`SoftwareApplication`** — `applicationCategory: 'UtilitiesApplication'`, `operatingSystem: 'Windows 10, Windows 11'`, `downloadUrl`, `softwareVersion`/`datePublished` from the live release, `license` MIT, `isAccessibleForFree: true`, `offers.price: '0'` (surfaces "Free"), `featureList`, author/publisher → Organization.
2. **`Organization`** — Camie Tech, `sameAs: ['https://github.com/Camie-Tech']`.
3. **`WebSite`** — Inumaki, `inLanguage: 'en-US'`, publisher → Organization. (No `SearchAction` — there's no on-site search.)
4. **`FAQPage`** — built from the same FAQ array; valid + feeds AI Overviews (no rich snippet, per May 2026 deprecation).
Validate with Google **Rich Results Test** + **Schema Markup Validator**.

### E. noindex for app/auth surface — **[NOW, shipped]**
`robots.ts` disallows the routes; additionally `auth/layout.tsx` exports `robots: { index:false, follow:false }` (covers signin/error/verify/desktop, including client pages), and `admin/page.tsx` + `dashboard/page.tsx` export the same. `/api/download/latest` now sends `X-Robots-Tag: noindex` and stays a **302** (target rotates per release).

### F. Core Web Vitals — protect what's already excellent
The page is an **async server component, CSS-only motion, no client hooks** — outstanding for LCP/INP. **Keep it that way.** Don't `priority` below-the-fold images (only the nav icon is `priority`). The waveform is fixed-height (no CLS). ISR (`revalidate: 300`) caches the GitHub fetch.
- **Optional [LATER]:** audit whether all four webfonts (Inter, Syne, Orbitron, IBM Plex Mono) are needed; dropping one cuts render cost. Add one real product screenshot `<Image>` (descriptive alt) so Image Search has something to index.

### G. Crawl/index hygiene — **[LATER]**
Verify the canonical host in **Google Search Console** + **Bing Webmaster Tools**; submit the sitemap; confirm `/api/download/latest` returns a clean disallowed 302.

---

## 5. Content & architecture roadmap (priority-ordered)

A single landing page caps keyword surface. Expand into a small **content hub**; each page targets one cluster and links back to `/` with descriptive anchors. Add each new URL to `sitemap.ts` on ship.

1. **FAQ + comparison + privacy + use-cases on `/`** — **[NOW, shipped]**.
2. **`/wispr-flow-alternative`** — **[LATER, highest ROI]** — targets `wispr flow alternative free / open source`. Honest table (Inumaki wins price/license/privacy/no-account; Wispr wins languages/cross-platform/AI auto-edit). Add `BreadcrumbList`.
3. **`/free-offline-dictation-windows`** — **[LATER]** — targets `free offline / open-source whisper dictation windows`.
4. **`/docs` (or `/help`)** — **[LATER]** — install, rebind hotkey, troubleshooting, model info, privacy explainer. Captures `how to …` long-tails + builds topical depth.
5. **`/changelog`** — **[LATER]** — mirror GitHub releases. Fresh-content signal; internal-linking hub.
6. **`/blog`** — **[LATER, only if sustainable]** — informational cluster feeding AI Overviews.

---

## 6. Off-page & distribution (OSS playbook, sequenced) — **[LATER]**

1. **GitHub repo (the SEO engine for OSS)** — optimize `Camie-Tech/inumaki-oss`: keyword-rich description; topics (`whisper`, `whisper-cpp`, `speech-to-text`, `dictation`, `voice-to-text`, `windows`, `electron`, `wispr-flow-alternative`, `offline`, `privacy`); README H1 + first paragraph keyword-rich, linking to the site.
2. **alternativeto.net** — submit Inumaki as an alternative to Wispr Flow, superwhisper, Dragon, Windows Voice Typing. **Highest-leverage single action after GitHub.**
3. **awesome-lists PRs** — `awesome-whisper`, `awesome-windows`, `awesome-electron`, `awesome-selfhosted`, `awesome-privacy`.
4. **Product Hunt launch** — "Inumaki — Free, open-source, 100% local voice-to-text for Windows."
5. **Hacker News** — `Show HN: Inumaki — local, private, open-source Windows dictation (whisper.cpp)`. One shot — time it.
6. **Reddit** — r/Windows, r/windowsapps, r/opensource, r/selfhosted, r/LocalLLaMA, r/software, r/accessibility, r/SideProject.
7. **dev.to / Hashnode** — a build/technical post with a canonical link back.
8. **Listicle/roundup outreach** — get included in "best free offline dictation 2026" / "Wispr Flow alternatives" roundups.
9. **Niche directories** — openalternative.co, console.dev, libhunt, slant.co, privacy-tool directories.
10. **A short demo GIF/video** of the Ctrl+Shift+Space → paste flow on X/Bluesky/LinkedIn.

**Launch sequence:** (1) ship NOW substrate → (2) optimize GitHub + submit alternativeto + awesome-lists → (3) Product Hunt + Show HN the **same week**, coordinated with a release → (4) Reddit + dev.to + listicle outreach → (5) sustain via changelog/blog.
**Critical prerequisite:** fix the product gaps (main-process recording, Ctrl+V simulation) so a Wispr refugee's first try actually pastes — otherwise the off-page push converts to bounces.

---

## 7. Measurement & 30/60/90-day timeline

**Track:** Google Search Console (impressions/clicks/position for target clusters, coverage, `SoftwareApplication` validity, sitemap read) · Bing Webmaster Tools · Rich Results Test · Core Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1) · social-preview QA (X/Slack/Discord/LinkedIn) · referring domains + GitHub stars/downloads.

- **Days 0–30 — Foundation (NOW work).** Set `NEXT_PUBLIC_SITE_URL`; ship metadata/sitemap/robots/manifest/OG/JSON-LD/FAQ/H1 fix; verify in GSC + Bing, submit sitemap, validate rich results, QA previews; optimize the GitHub repo. *Exit:* one canonical host indexed; structured data valid; previews fixed.
- **Days 31–60 — Expansion + first links.** Resolve `inumaki.camie.tech` DNS → flip env var → 308 the `.vercel.app` host → reverify. Ship `/wispr-flow-alternative` + `/docs`; submit alternativeto + awesome-list PRs.
- **Days 61–90 — Launch + momentum.** Coordinated Product Hunt + Show HN with a release (only after the recording/Ctrl+V gaps are closed). Reddit + dev.to + listicle outreach. Ship `/changelog`.

---

## Top 10 actions (NOW / LATER)

1. **[NOW ✓]** Env-driven canonical; fix the OG `url`/`metadataBase` mismatch; add `alternates.canonical`.
2. **[NOW ✓]** `sitemap.ts`, `robots.ts` (disallow `/api`, `/auth`, `/dashboard`, `/admin`), `manifest.ts`.
3. **[NOW ✓]** `SoftwareApplication` + `Organization` + `WebSite` JSON-LD, version/date from the live release.
4. **[NOW ✓]** Rewrite `<title>`/`<meta description>`; add title template + Twitter card.
5. **[NOW ✓]** `opengraph-image.tsx` + `twitter-image.tsx` (1200×630, `#0b0f14`).
6. **[NOW ✓]** FAQ section on `/` + `FAQPage` JSON-LD.
7. **[NOW ✓]** H1/lead-copy fix — keyword-rich primary line, "Inumaki" as eyebrow, add "free and open-source."
8. **[LATER]** `/wispr-flow-alternative` comparison page + on-`/` teaser.
9. **[LATER]** GitHub repo optimization + alternativeto.net + awesome-lists.
10. **[LATER]** Coordinated Product Hunt + Show HN launch (after product gaps fixed); verify GSC + Bing.

### Sources & caveats
- **FAQ rich-result deprecation (May 7, 2026)** corrects the original brief's premise.
- **Keyword volume/difficulty** are qualitative SERP estimates — **validate in GSC/Ahrefs/Semrush before committing budget.**
- **Product-gap honesty:** the desktop recording/Ctrl+V path is incomplete and the app is English-/Windows-only; all copy, FAQ, and the comparison must stay candid to avoid bounce-driven ranking loss.

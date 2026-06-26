import Image from 'next/image';
import {
  formatReleaseSize,
  getInumakiRepoStars,
  getLatestInumakiRelease,
  INUMAKI_DOWNLOAD_URL,
  INUMAKI_RELEASES_URL,
  INUMAKI_REPO_URL,
  selectWindowsDownloadAsset,
} from '@/lib/github-release';
import { SITE_URL } from '@/lib/site';

const APP_DESCRIPTION =
  'Free, open-source voice-to-text for Windows. Press a global hotkey, speak in any app, and paste clean text — transcribed 100% on-device with whisper.cpp. No account, no cloud.';

// Source of truth for both the rendered FAQ section and the FAQPage JSON-LD.
const FAQ_ITEMS = [
  {
    question: 'Is Inumaki really free?',
    answer:
      "Yes — Inumaki is 100% free and open source under the MIT license. There's no subscription, no word cap, no trial, and no paid tier. Download it, run it, and dictate as much as you want, forever.",
  },
  {
    question: 'Does my voice or audio ever get uploaded?',
    answer:
      'No. Transcription runs entirely on your own computer using whisper.cpp, with the model bundled inside the app. Inumaki makes no network calls to transcribe your speech — your audio is processed on-device and never leaves your machine. Because it is open source, you can read the code and verify this yourself.',
  },
  {
    question: 'Does Inumaki work offline, without internet?',
    answer:
      'Yes. Everything happens locally on your CPU, so Inumaki works fully offline — on a plane, on bad Wi-Fi, or in air-gapped and secure environments where cloud dictation tools are blocked. The only time it touches the internet is when you check for a new version.',
  },
  {
    question: "How do I use it / what's the hotkey?",
    answer:
      'Press Ctrl + Shift + Space anywhere in Windows to start listening, speak naturally, and your clean transcript is ready to paste at your cursor in any app — editors, chat, browsers, terminals.',
  },
  {
    question: 'How accurate is the transcription?',
    answer:
      'Inumaki uses the whisper.cpp ggml-base.en model, which produces punctuated, well-formatted English text and handles natural speech well in a reasonably quiet room. It runs after you finish speaking (in seconds), rather than streaming word-by-word.',
  },
  {
    question: 'Does it support languages other than English?',
    answer:
      'Not yet — Inumaki ships with the English whisper.cpp model (ggml-base.en) today. More languages are on the roadmap, and because it is open source, you are free to drop in a different whisper.cpp model now. If you need 100+ languages right away, a cloud tool like Wispr Flow may suit you better; Inumaki focuses on excellent, private, free English dictation.',
  },
  {
    question: 'Windows shows a SmartScreen warning when I run it — is that safe?',
    answer:
      "Yes. Inumaki is an open-source indie app and the installer isn't code-signed yet, so Windows SmartScreen shows a 'Windows protected your PC' prompt for unrecognized publishers. Click 'More info', then 'Run anyway'. If you'd rather not trust a binary at all, you can build it yourself from the public source on GitHub.",
  },
  {
    question: 'What are the system requirements?',
    answer:
      "Windows 10 or 11, 64-bit (x64). Any modern CPU works — no GPU and no internet are required. You'll need a microphone. There's no account to create. Windows on ARM isn't supported yet.",
  },
  {
    question: 'Is there a Mac or Linux version?',
    answer:
      'Not yet — Inumaki is Windows-first. macOS and Linux are not supported at this time. It is open source, so cross-platform contributions are welcome, but the current build targets Windows x64 only.',
  },
  {
    question: 'How is Inumaki different from Wispr Flow?',
    answer:
      'Wispr Flow is a polished, paid, cloud-based tool with AI auto-editing and 100+ languages. Inumaki is the free, open-source, fully-local alternative: your audio never leaves your PC, there is no account or subscription, and you can audit every line of code. The trade-off is that Inumaki is English-only and Windows-only today, and does not yet do AI rewriting. If privacy, price, and offline use matter most, Inumaki is for you.',
  },
  {
    question: 'How do I uninstall it?',
    answer:
      'Inumaki uninstalls like any standard Windows app — through Settings → Apps → Installed apps, or "Add or remove programs". Because nothing is stored in the cloud and no account exists, removing the app removes everything; there is no data left on a server.',
  },
  {
    question: 'Why is it called Inumaki?',
    answer:
      "It's a nod to a character known for speaking in a very deliberate, controlled way — fitting for a tool that turns your spoken words into precise text. It's published by Camie Tech.",
  },
];

// Honest comparison. `inumakiWins` drives the cyan/check treatment; conceded
// rows (languages, platforms, AI formatting) stay neutral — no fake clean sweep.
const COMPARISON_ROWS = [
  {
    feature: 'Price',
    inumaki: 'Free forever — no subscription, no word cap',
    rival: '~$15/mo Pro; free tier capped at ~2,000 words/week',
    inumakiWins: true,
  },
  {
    feature: 'Where audio is processed',
    inumaki: '100% on your device',
    rival: 'Uploaded to the cloud',
    inumakiWins: true,
  },
  {
    feature: 'Works offline',
    inumaki: 'Yes — even with Wi-Fi off',
    rival: 'No — requires internet',
    inumakiWins: true,
  },
  {
    feature: 'Account required',
    inumaki: 'No account, no sign-up',
    rival: 'Yes — login required, even on free tier',
    inumakiWins: true,
  },
  {
    feature: 'Source code',
    inumaki: 'Open source (MIT) — audit it yourself',
    rival: 'Closed source',
    inumakiWins: true,
  },
  {
    feature: 'Telemetry / data collection',
    inumaki: 'None',
    rival: 'Context-awareness can send nearby text to servers',
    inumakiWins: true,
  },
  {
    feature: 'Setup',
    inumaki: 'Model bundled — no downloads, no API key',
    rival: 'Account + cloud connection required',
    inumakiWins: true,
  },
  {
    feature: 'Languages',
    inumaki: 'English only today (more on the roadmap)',
    rival: '100+ languages',
    inumakiWins: false,
  },
  {
    feature: 'Platforms',
    inumaki: 'Windows 10 & 11 (x64)',
    rival: 'macOS, Windows, iOS, Android',
    inumakiWins: false,
  },
  {
    feature: 'AI auto-formatting & commands',
    inumaki: 'Not yet',
    rival: 'Yes — auto-edit, tone matching, commands',
    inumakiWins: false,
  },
];

const PERSONAS = [
  {
    title: 'Developers',
    icon: <CodeGlyph />,
    body: 'Dictate commit messages, comments, PR descriptions, and Slack replies without leaving the keyboard. Works in VS Code, terminals, and any editor.',
  },
  {
    title: 'Writers & students',
    icon: <PenGlyph />,
    body: 'Draft emails, essays, and long-form notes at speaking speed, then clean them up later. No word limits getting in your way.',
  },
  {
    title: 'Accessibility & RSI',
    icon: <AccessibilityGlyph />,
    body: 'Give your wrists a break. A free, private alternative to expensive dictation suites — no subscription, no cloud, no lock-in.',
  },
  {
    title: 'Privacy-first & offline teams',
    icon: <ShieldGlyph />,
    body: 'Legal, healthcare, finance, government, and travelers: dictate where cloud tools are blocked or untrusted. Your audio physically cannot leave the device.',
  },
];

export default async function HomePage() {
  const [release, stars] = await Promise.all([
    getLatestInumakiRelease({ revalidate: 300, timeoutMs: 3000 }).catch(() => null),
    getInumakiRepoStars({ revalidate: 300, timeoutMs: 3000 }),
  ]);
  const asset = release ? selectWindowsDownloadAsset(release) : null;
  const releaseLabel = release?.tag_name ?? 'latest';
  // Only surface a size when we actually have one, so the chip never reads
  // the "Release asset" placeholder that formatReleaseSize returns for 0/undefined.
  const assetLabel = asset?.size ? formatReleaseSize(asset.size) : 'latest Windows build';
  const publishedDate = release?.published_at
    ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
        new Date(release.published_at),
      )
    : 'live from GitHub';
  const starLabel = stars != null ? stars.toLocaleString('en') : null;

  const metaChips = [
    { label: 'Version', value: releaseLabel },
    { label: 'Released', value: publishedDate },
    { label: 'Size', value: assetLabel },
    { label: 'Platform', value: 'Windows x64' },
    { label: 'License', value: 'MIT' },
  ];
  if (starLabel) {
    metaChips.push({ label: 'GitHub', value: `★ ${starLabel}` });
  }

  const systemRequirements = [
    { label: 'OS', value: 'Windows 10 or 11 (64-bit · x64)' },
    { label: 'Processor', value: 'Any modern x64 CPU — no GPU' },
    { label: 'Disk', value: `~${assetLabel} download · model bundled` },
    { label: 'Internet', value: 'Not required — 100% offline' },
    { label: 'Microphone', value: 'Required' },
    { label: 'Account', value: 'None' },
  ];

  // Hand-tuned, organic waveform envelope (not a tiling modulo pattern).
  const waveBars = [
    0.32, 0.55, 0.78, 0.46, 0.9, 0.6, 0.4, 0.72, 0.95, 0.52, 0.34, 0.66, 0.85, 0.48, 0.7, 0.38,
    0.82, 0.58, 0.44, 0.76, 0.92, 0.5, 0.36, 0.68, 0.88, 0.54, 0.42, 0.62,
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Camie Tech',
        url: 'https://www.camie.tech',
        sameAs: ['https://github.com/Camie-Tech'],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: 'Inumaki',
        description: APP_DESCRIPTION,
        inLanguage: 'en-US',
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#software`,
        name: 'Inumaki',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Windows 10, Windows 11',
        description: APP_DESCRIPTION,
        url: `${SITE_URL}/`,
        downloadUrl: INUMAKI_DOWNLOAD_URL,
        softwareVersion: releaseLabel,
        ...(release?.published_at ? { datePublished: release.published_at } : {}),
        license: 'https://opensource.org/licenses/MIT',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: [
          'Global hotkey Ctrl+Shift+Space',
          '100% local on-device transcription via whisper.cpp',
          'Works in any Windows app',
          'No account, no cloud, no subscription',
        ],
        author: { '@id': `${SITE_URL}/#organization` },
        publisher: { '@id': `${SITE_URL}/#organization` },
        image: `${SITE_URL}/opengraph-image`,
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/#faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0b0f14] text-slate-200 antialiased selection:bg-[#00aeef]/30 selection:text-white">
      {/* Structured data: SoftwareApplication + Organization + WebSite + FAQPage */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {/* ===== Ambient backdrop (decorative) ===== */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0b0f14]" />
        <div className="ink-aurora absolute left-1/2 top-[-18%] h-[60vh] w-[120vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(0,174,239,0.20),transparent_70%)] blur-3xl" />
        <div className="ink-aurora-x absolute right-[-10%] top-[28%] h-[50vh] w-[55vw] rounded-full bg-[radial-gradient(closest-side,rgba(66,202,255,0.13),transparent_70%)] blur-3xl" />
        <div className="absolute left-[-10%] bottom-[-10%] h-[45vh] w-[55vw] rounded-full bg-[radial-gradient(closest-side,rgba(0,174,239,0.09),transparent_70%)] blur-3xl" />
        <div className="ink-grid absolute inset-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(11,15,20,0.55)_62%,#0b0f14)]" />
      </div>

      {/* ===== Skip link ===== */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[#00aeef] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#04131c]"
      >
        Skip to content
      </a>

      {/* ===== NAV ===== */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0b0f14]/70 backdrop-blur-xl">
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6"
        >
          <a
            href="#main"
            className="group flex items-center gap-3 rounded-2xl px-1 py-1 outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14]"
          >
            <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/brand/inumaki-icon-dark-transparent.png"
                alt="Inumaki app icon"
                width={40}
                height={40}
                priority
                className="h-10 w-10 object-contain"
              />
            </span>
            <span className="flex flex-col leading-none">
              <span
                className="text-[0.62rem] font-medium uppercase tracking-[0.32em] text-slate-400"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Camie Tech
              </span>
              <span
                className="text-lg font-bold tracking-[0.14em] text-white"
                style={{ fontFamily: 'var(--font-orbitron)' }}
              >
                INUMAKI
              </span>
            </span>
          </a>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={INUMAKI_REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="hidden min-h-[44px] items-center gap-2 rounded-full px-4 text-sm font-medium text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14] sm:inline-flex"
            >
              <GitHubGlyph />
              GitHub
              {starLabel && (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs text-slate-200">
                  <StarGlyph /> {starLabel}
                </span>
              )}
            </a>
            <a
              href={INUMAKI_DOWNLOAD_URL}
              className="group inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#00aeef] px-5 text-sm font-semibold text-[#04131c] shadow-[0_8px_24px_-8px_rgba(0,174,239,0.7)] transition-all duration-200 hover:bg-[#42caff] hover:shadow-[0_10px_30px_-8px_rgba(66,202,255,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14]"
            >
              <DownloadGlyph className="transition-transform duration-200 group-hover:translate-y-0.5" />
              Download
            </a>
          </div>
        </nav>
      </header>

      <main id="main">
        {/* ===== HERO ===== */}
        <section className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pt-20 lg:pb-20 lg:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.04fr_0.96fr] lg:gap-12">
            {/* Copy column */}
            <div className="text-center lg:text-left">
              <span className="ink-reveal inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="ink-ping absolute inline-flex h-full w-full rounded-full bg-[#00aeef] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#42caff]" />
                </span>
                Free &amp; open source · runs 100% on your machine
              </span>

              <h1 className="mt-7">
                <span
                  className="ink-reveal ink-delay-1 block text-sm font-bold uppercase tracking-[0.32em] text-[#7fdcff] sm:text-base"
                  style={{ fontFamily: 'var(--font-orbitron)' }}
                >
                  Inumaki
                </span>
                <span
                  className="ink-reveal ink-delay-2 mt-4 block text-balance text-4xl font-semibold leading-[1.08] text-white drop-shadow-[0_0_30px_rgba(0,174,239,0.18)] sm:text-6xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Press a key. Speak.{' '}
                  <span className="text-[#42caff]">Paste clean text</span> anywhere.
                </span>
                <span
                  className="ink-reveal ink-delay-3 mt-4 block text-sm text-slate-400 sm:text-base"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Local voice-to-text for Windows · whisper.cpp on-device
                </span>
              </h1>

              <p className="ink-reveal ink-delay-3 mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg lg:mx-0">
                Inumaki is a free, open-source voice-to-text app for Windows that lives in your
                tray. Hit a global hotkey, talk in any app, and your transcript is ready to paste at
                the cursor — transcribed locally with whisper.cpp. No account, no cloud, no
                subscription. Your audio never leaves the machine.
              </p>

              {/* CTAs */}
              <div className="ink-reveal ink-delay-4 mt-9 flex flex-col items-center gap-3 sm:flex-row lg:items-start lg:justify-start">
                <a
                  href={INUMAKI_DOWNLOAD_URL}
                  className="group inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-full bg-[#00aeef] px-8 text-base font-semibold text-[#04131c] shadow-[0_14px_40px_-12px_rgba(0,174,239,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#42caff] hover:shadow-[0_18px_48px_-12px_rgba(66,202,255,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14] sm:w-auto"
                >
                  <DownloadGlyph className="transition-transform duration-200 group-hover:translate-y-0.5" />
                  Download for Windows
                </a>
                <a
                  href={INUMAKI_REPO_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 text-base font-medium text-slate-200 backdrop-blur transition-colors hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14] sm:w-auto"
                >
                  <GitHubGlyph />
                  Star on GitHub{starLabel ? ` · ★ ${starLabel}` : ''}
                </a>
              </div>

              {/* Download de-risking microcopy */}
              <p
                className="ink-reveal ink-delay-4 mt-3 text-xs text-slate-400"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                Windows 10 &amp; 11 · {releaseLabel} · {assetLabel} · .exe · no account, no sign-up
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Unsigned indie build — if Windows shows a SmartScreen prompt, choose “More info →
                Run anyway.”{' '}
                <a
                  href="#faq"
                  className="rounded text-[#7fdcff] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14]"
                >
                  Why?
                </a>
              </p>
              {!asset && (
                <p className="mt-1 text-xs text-slate-400">
                  Can’t reach the download?{' '}
                  <a
                    href={INUMAKI_RELEASES_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rounded text-[#7fdcff] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14]"
                  >
                    Browse all releases on GitHub →
                  </a>
                </p>
              )}

              {/* Release meta chips */}
              <dl
                className="ink-reveal ink-delay-5 mt-8 flex flex-wrap items-center justify-center gap-2 lg:justify-start"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {metaChips.map((chip) => (
                  <div
                    key={chip.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs backdrop-blur"
                  >
                    <dt className="text-slate-400">{chip.label}</dt>
                    <dd className="font-medium text-slate-100">{chip.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* ===== Centerpiece product visual ===== */}
            <div
              role="img"
              aria-label="Illustration: Inumaki listening, transcribing speech on-device, and the resulting clean text ready to paste."
              className="ink-reveal ink-delay-3 relative mx-auto w-full max-w-md lg:max-w-none"
            >
              <div
                aria-hidden="true"
                className="absolute -inset-8 -z-10 rounded-[3rem] bg-[radial-gradient(closest-side,rgba(0,174,239,0.22),transparent_75%)] blur-2xl"
              />
              <div className="ink-float rounded-[2.25rem] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-2 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl">
                <div className="relative overflow-hidden rounded-[1.85rem] border border-white/[0.06] bg-[#0c1219] p-6 sm:p-7">
                  {/* hairline top accent */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#42caff]/60 to-transparent"
                  />

                  {/* card header */}
                  <div aria-hidden="true" className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-white/10">
                        <Image
                          src="/brand/inumaki-icon-dark-transparent.png"
                          alt=""
                          width={36}
                          height={36}
                          className="h-9 w-9 object-contain"
                        />
                      </span>
                      <div className="leading-tight">
                        <p className="text-sm font-semibold text-white">Inumaki</p>
                        <p
                          className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400"
                          style={{ fontFamily: 'var(--font-mono)' }}
                        >
                          Listening
                        </p>
                      </div>
                    </div>
                    <span
                      className="inline-flex items-center gap-2 rounded-full bg-[#00aeef]/10 px-3 py-1 text-xs font-medium text-[#7fdcff] ring-1 ring-[#00aeef]/30"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      <span className="ink-pulse h-2 w-2 rounded-full bg-[#00aeef]" />
                      REC
                    </span>
                  </div>

                  {/* waveform */}
                  <div
                    aria-hidden="true"
                    className="mt-7 flex h-24 items-end justify-center gap-[3px] rounded-2xl bg-black/30 px-4 ring-1 ring-white/5 sm:gap-1"
                  >
                    {waveBars.map((peak, i) => (
                      <span
                        key={i}
                        className="ink-wave h-full w-[3px] rounded-full bg-gradient-to-t from-[#00aeef] to-[#42caff] sm:w-1.5"
                        style={
                          {
                            animationDelay: `${(i % 7) * 110}ms`,
                            ['--ink-min' as string]: '0.18',
                            ['--ink-max' as string]: `${peak}`,
                          } as React.CSSProperties
                        }
                      />
                    ))}
                  </div>

                  {/* transcript preview */}
                  <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <p
                      className="text-[0.65rem] uppercase tracking-[0.22em] text-slate-400"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      Ready to paste into your editor
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-200 sm:text-base">
                      Schedule the design review for Thursday and loop in the team.
                      <span
                        aria-hidden="true"
                        className="ink-caret ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[2px] bg-[#42caff] align-middle"
                      />
                    </p>
                  </div>

                  {/* keycap row */}
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <div aria-hidden="true" className="flex items-center gap-1.5">
                      <Keycap>Ctrl</Keycap>
                      <span className="text-slate-400">+</span>
                      <Keycap>Shift</Keycap>
                      <span className="text-slate-400">+</span>
                      <Keycap>Space</Keycap>
                    </div>
                    <span
                      className="text-xs text-slate-300"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      global hotkey
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== TRUST / FEATURE STRIP (6 cells) ===== */}
        <section aria-labelledby="trust-heading" className="border-y border-white/[0.06]">
          <h2 id="trust-heading" className="sr-only">
            Why Inumaki
          </h2>
          <div className="mx-auto grid max-w-6xl gap-px bg-white/[0.06] px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCell
              title="100% local transcription"
              icon={<ShieldGlyph />}
              body="whisper.cpp and the model ship inside the open-source build. Your microphone audio is processed on device and never uploaded anywhere."
            />
            <FeatureCell
              title="Windows 10 & 11, tray-first"
              icon={<WindowsGlyph />}
              body="Lives quietly in the system tray and works in every Windows app — editors, chat, browsers, terminals. No browser tab, no account."
            />
            <FeatureCell
              title="Open source · MIT"
              icon={<CodeGlyph />}
              body="Built and published by Camie Tech under the MIT license. Read the code, audit the privacy, fork it, and make it yours."
            />
            <FeatureCell
              title="No account, no telemetry"
              icon={<NoAccountGlyph />}
              body="No sign-up, no login, no API key, no usage cap. Download, run, dictate. Nothing about you is collected or uploaded — ever."
            />
            <FeatureCell
              title="Model bundled — zero setup"
              icon={<BundleGlyph />}
              body="The ggml-base.en whisper.cpp model ships inside the app. No extra downloads, no model manager, no cloud key. It works on first launch."
            />
            <FeatureCell
              title="Works offline, even on a plane"
              icon={<OfflineGlyph />}
              body="Lightweight and tray-resident, Inumaki runs entirely on your CPU — no GPU and no internet required. Dictate on a flight or on bad Wi-Fi."
            />
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section
          aria-labelledby="how-heading"
          className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
        >
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>How it works</SectionEyebrow>
            <h2
              id="how-heading"
              className="mt-4 text-balance text-3xl font-semibold text-white sm:text-4xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Three keystrokes from voice to text
            </h2>
            <p className="mt-4 text-pretty text-slate-300">
              No setup rituals, no copy-paste shuffle. Inumaki fits into the way you already work.
            </p>
          </div>

          <ol className="mt-14 grid gap-px overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-white/[0.05] sm:grid-cols-3">
            <Step
              n="01"
              title="Press the hotkey"
              body="Anywhere in Windows, tap Ctrl + Shift + Space. Inumaki starts listening instantly from the tray."
            />
            <Step
              n="02"
              title="Speak naturally"
              body="Talk like you would to a colleague. When you stop, whisper.cpp transcribes on device in seconds — fully offline, no network round-trip."
            />
            <Step
              n="03"
              title="Paste it anywhere"
              body="Your clean, punctuated transcript is ready on the clipboard — paste it straight into any Windows app, right where your cursor was."
            />
          </ol>
        </section>

        {/* ===== PRIVACY DEEP-DIVE ===== */}
        <section
          aria-labelledby="privacy-heading"
          className="border-t border-white/[0.06] bg-white/[0.012]"
        >
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <SectionEyebrow>Private by architecture, not by promise</SectionEyebrow>
              <h2
                id="privacy-heading"
                className="mt-4 text-balance text-3xl font-semibold text-white sm:text-4xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Your voice never leaves your PC. Here’s how.
              </h2>
              <p className="mt-4 text-pretty text-slate-300">
                There is no cloud step to trust, because there is no cloud step. Audio is captured,
                transcribed by whisper.cpp on your own CPU, and written to your clipboard — all
                on-device.
              </p>
            </div>

            {/* Flow diagram */}
            <div className="mx-auto mt-12 flex max-w-4xl flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
              <FlowNode icon={<MicGlyph />} title="Your microphone" subtitle="captured locally" />
              <FlowArrow />
              <FlowNode
                icon={<ChipGlyph />}
                title="whisper.cpp"
                subtitle="on your CPU · model bundled"
              />
              <FlowArrow />
              <FlowNode
                icon={<ClipboardGlyph />}
                title="Your clipboard"
                subtitle="→ paste at the cursor"
              />
            </div>
            <p
              className="mt-5 text-center text-xs text-slate-400"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              No server. No upload. No network request for transcription.
            </p>

            {/* Guarantee cards */}
            <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-3">
              <GuaranteeCard
                title="No network calls to transcribe"
                body="Works fully offline, even with Wi-Fi off. The only network use is an optional check for a new version."
              />
              <GuaranteeCard
                title="No account, no telemetry"
                body="Nothing to sign up for and nothing phoned home. There is no analytics SDK and no usage tracking."
              />
              <GuaranteeCard
                title="Model bundled — no BYOK"
                body="ggml-base.en ships inside the build. No extra downloads, no API key, no cloud model to call."
              />
            </div>

            {/* Audit callout */}
            <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 rounded-[1.5rem] border border-[#00aeef]/25 bg-[#00aeef]/[0.06] p-6 text-center sm:p-8">
              <p className="text-pretty text-slate-200">
                Don’t take our word for it. Inumaki is MIT-licensed and the transcription path is
                open — read the exact code that proves your audio stays local.
              </p>
              <a
                href={INUMAKI_REPO_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-medium text-slate-100 transition-colors hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14]"
              >
                <GitHubGlyph />
                Read the source on GitHub
                <ArrowGlyph />
              </a>
            </div>
          </div>
        </section>

        {/* ===== COMPARISON: Inumaki vs cloud dictation ===== */}
        <section
          aria-labelledby="compare-heading"
          className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-24"
        >
          <div className="mx-auto max-w-2xl text-center">
            <SectionEyebrow>The honest comparison</SectionEyebrow>
            <h2
              id="compare-heading"
              className="mt-4 text-balance text-3xl font-semibold text-white sm:text-4xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Why free and local beats cloud dictation
            </h2>
            <p className="mt-4 text-pretty text-slate-300">
              Wispr Flow is a polished, paid, cloud tool — and genuinely good at AI formatting and
              100+ languages. Here’s exactly where each one wins, with nothing hidden.
            </p>
          </div>

          <div className="mt-12 overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-white/[0.02]">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">
                Inumaki versus cloud dictation such as Wispr Flow
              </caption>
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th
                    scope="col"
                    className="px-4 py-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-400 sm:px-6"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    Feature
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-4 text-sm font-semibold text-[#42caff] sm:px-6"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Inumaki
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-4 text-sm font-semibold text-slate-300 sm:px-6"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Cloud dictation
                    <span className="block text-xs font-normal text-slate-500">
                      e.g. Wispr Flow
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-b border-white/[0.05] last:border-0 even:bg-white/[0.015]"
                  >
                    <th
                      scope="row"
                      className="px-4 py-4 align-top font-medium text-slate-200 sm:px-6"
                    >
                      {row.feature}
                    </th>
                    <td className="px-4 py-4 align-top sm:px-6">
                      <span
                        className={
                          row.inumakiWins
                            ? 'flex items-start gap-2 font-medium text-[#7fdcff]'
                            : 'flex items-start gap-2 text-slate-300'
                        }
                      >
                        {row.inumakiWins ? (
                          <CheckGlyph className="mt-0.5 shrink-0 text-[#42caff]" />
                        ) : (
                          <DotGlyph className="mt-0.5 shrink-0 text-slate-500" />
                        )}
                        <span>{row.inumaki}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top text-slate-400 sm:px-6">{row.rival}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 text-center text-xs text-slate-500">
            Comparison reflects publicly documented features as of June 2026. Wispr Flow is a
            trademark of its respective owner; Inumaki is not affiliated with or endorsed by Wispr
            Flow.
          </p>
        </section>

        {/* ===== USE CASES ===== */}
        <section
          aria-labelledby="who-heading"
          className="border-t border-white/[0.06] bg-white/[0.012]"
        >
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <SectionEyebrow>Who it’s for</SectionEyebrow>
              <h2
                id="who-heading"
                className="mt-4 text-balance text-3xl font-semibold text-white sm:text-4xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Built for anyone who’d rather talk than type
              </h2>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PERSONAS.map((persona) => (
                <div
                  key={persona.title}
                  className="group rounded-[1.5rem] border border-white/[0.07] bg-white/[0.02] p-6 transition-colors duration-300 hover:border-white/15 hover:bg-white/[0.04]"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00aeef]/10 text-[#42caff] ring-1 ring-[#00aeef]/25 transition-transform duration-300 group-hover:scale-105">
                    {persona.icon}
                  </span>
                  <h3
                    className="mt-5 text-base font-semibold text-white"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {persona.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{persona.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section
          aria-labelledby="faq-heading"
          id="faq"
          className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24"
        >
          <div className="text-center">
            <SectionEyebrow>Questions, answered honestly</SectionEyebrow>
            <h2
              id="faq-heading"
              className="mt-4 text-balance text-3xl font-semibold text-white sm:text-4xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Frequently asked questions
            </h2>
          </div>
          <dl className="mt-12 divide-y divide-white/[0.07] overflow-hidden rounded-[1.5rem] border border-white/[0.07] bg-white/[0.02]">
            {FAQ_ITEMS.map((item) => (
              <details key={item.question} className="group px-5 py-1 sm:px-7">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14] [&::-webkit-details-marker]:hidden">
                  <dt className="text-base font-medium text-slate-100">{item.question}</dt>
                  <PlusGlyph className="shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-45" />
                </summary>
                <dd className="pb-5 pr-8 text-sm leading-relaxed text-slate-300">{item.answer}</dd>
              </details>
            ))}
          </dl>
        </section>

        {/* ===== SYSTEM REQUIREMENTS ===== */}
        <section
          aria-labelledby="sysreq-heading"
          className="mx-auto w-full max-w-5xl px-4 pb-4 sm:px-6"
        >
          <div className="rounded-[1.5rem] border border-white/[0.07] bg-white/[0.02] p-6 sm:p-8">
            <h2
              id="sysreq-heading"
              className="text-lg font-semibold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              System requirements
            </h2>
            <dl
              className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              {systemRequirements.map((req) => (
                <div
                  key={req.label}
                  className="flex items-baseline justify-between gap-3 border-b border-white/[0.05] pb-2 text-sm"
                >
                  <dt className="text-slate-400">{req.label}</dt>
                  <dd className="text-right font-medium text-slate-100">{req.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-xs text-slate-400">
              Windows on ARM and macOS/Linux are not supported yet — Inumaki is Windows-first.
            </p>
          </div>
        </section>

        {/* ===== FINAL CTA BAND ===== */}
        <section
          aria-labelledby="cta-heading"
          className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
        >
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-8 text-center shadow-[0_40px_120px_-50px_rgba(0,174,239,0.6)] sm:p-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(closest-side,rgba(0,174,239,0.18),transparent_70%)]"
            />
            <Image
              src="/brand/inumaki-icon-dark-transparent.png"
              alt=""
              width={64}
              height={64}
              className="ink-float mx-auto h-16 w-16 object-contain"
            />
            <h2
              id="cta-heading"
              className="mt-6 text-balance text-3xl font-semibold text-white sm:text-4xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Start dictating in under a minute
            </h2>
            <p className="mx-auto mt-4 max-w-md text-pretty text-slate-300">
              Free, open source, and private by design. Download the latest Windows build and give
              your keyboard a break.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={INUMAKI_DOWNLOAD_URL}
                className="group inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-full bg-[#00aeef] px-8 text-base font-semibold text-[#04131c] shadow-[0_14px_40px_-12px_rgba(0,174,239,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#42caff] hover:shadow-[0_18px_48px_-12px_rgba(66,202,255,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14] sm:w-auto"
              >
                <DownloadGlyph className="transition-transform duration-200 group-hover:translate-y-0.5" />
                Download {releaseLabel}
              </a>
              <a
                href={INUMAKI_REPO_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 text-base font-medium text-slate-200 backdrop-blur transition-colors hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14] sm:w-auto"
              >
                <GitHubGlyph />
                View source on GitHub
                <ArrowGlyph />
              </a>
            </div>
            <p className="mt-6 text-xs text-slate-400" style={{ fontFamily: 'var(--font-mono)' }}>
              {releaseLabel} · {publishedDate} · {assetLabel} · Windows x64 · MIT
            </p>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-6">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/brand/inumaki-icon-dark-transparent.png"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <p
                className="text-sm font-bold tracking-[0.12em] text-white"
                style={{ fontFamily: 'var(--font-orbitron)' }}
              >
                INUMAKI
              </p>
            </div>
            <p className="mt-4 max-w-xs text-sm text-slate-400">
              Built and maintained in the open by Camie Tech. Issues and PRs welcome.
            </p>
          </div>

          <FooterColumn title="Product">
            <FooterLink href={INUMAKI_DOWNLOAD_URL}>Download for Windows</FooterLink>
            <FooterLink href="#faq">FAQ</FooterLink>
            <FooterLink href="#sysreq-heading">System requirements</FooterLink>
            <FooterLink href={INUMAKI_RELEASES_URL} external>
              Release notes
            </FooterLink>
          </FooterColumn>

          <FooterColumn title="Open source">
            <FooterLink href={INUMAKI_REPO_URL} external>
              View source on GitHub
            </FooterLink>
            <FooterLink href={`${INUMAKI_REPO_URL}/issues`} external>
              Report an issue
            </FooterLink>
            <FooterLink href={`${INUMAKI_REPO_URL}/blob/main/LICENSE`} external>
              License (MIT)
            </FooterLink>
            <FooterLink href="https://www.camie.tech" external>
              www.camie.tech
            </FooterLink>
          </FooterColumn>
        </div>
        <p className="border-t border-white/[0.04] px-4 pb-8 pt-6 text-center text-xs text-slate-400 sm:px-6">
          © {new Date().getFullYear()} Camie Tech. Inumaki is open-source software released under the
          MIT License. Audio is transcribed locally and never leaves your device.
        </p>
      </footer>
    </div>
  );
}

/* ---------- Presentational helpers (server-safe, no client hooks) ---------- */

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7fdcff]"
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {children}
    </p>
  );
}

function FeatureCell({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group bg-[#0b0f14] p-8 transition-colors duration-300 hover:bg-[#0c1219] md:p-10">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00aeef]/10 text-[#42caff] ring-1 ring-[#00aeef]/25 transition-transform duration-300 group-hover:scale-105">
        {icon}
      </span>
      <h3
        className="mt-5 text-lg font-semibold text-white"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="group relative overflow-hidden bg-[#0c1219] p-7 transition-colors duration-300 hover:bg-[#0e151d] sm:p-8">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-5 top-3 text-6xl font-black text-white/[0.05] transition-colors duration-300 group-hover:text-[#00aeef]/15"
        style={{ fontFamily: 'var(--font-orbitron)' }}
      >
        {n}
      </span>
      <span
        className="relative inline-flex text-xs font-bold tracking-[0.18em] text-[#7fdcff]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        STEP {n}
      </span>
      <h3
        className="relative mt-4 text-lg font-semibold text-white"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h3>
      <p className="relative mt-2 text-sm leading-relaxed text-slate-300">{body}</p>
    </li>
  );
}

function FlowNode({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-6 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00aeef]/10 text-[#42caff] ring-1 ring-[#00aeef]/25">
        {icon}
      </span>
      <p className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>
        {title}
      </p>
      <p className="text-xs text-slate-400" style={{ fontFamily: 'var(--font-mono)' }}>
        {subtitle}
      </p>
    </div>
  );
}

function FlowArrow() {
  return (
    <span aria-hidden="true" className="flex shrink-0 items-center justify-center text-[#42caff]">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5 rotate-90 sm:rotate-0"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    </span>
  );
}

function GuaranteeCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
      <div className="flex items-center gap-2.5">
        <CheckGlyph className="shrink-0 text-[#42caff]" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{body}</p>
    </div>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="text-[0.62rem] font-medium uppercase tracking-[0.32em] text-slate-400"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {title}
      </p>
      <ul className="mt-4 flex flex-col gap-1">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  external = false,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  const externalProps = external ? { target: '_blank', rel: 'noreferrer noopener' } : {};
  return (
    <li>
      <a
        href={href}
        {...externalProps}
        className="inline-flex min-h-[40px] items-center rounded text-sm text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14]"
      >
        {children}
      </a>
    </li>
  );
}

function Keycap({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="inline-flex min-h-[34px] min-w-[34px] items-center justify-center rounded-lg border border-white/15 border-b-white/25 bg-gradient-to-b from-white/10 to-white/[0.03] px-2.5 text-xs font-medium text-slate-100 shadow-[0_2px_0_rgba(0,0,0,0.4)]"
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {children}
    </kbd>
  );
}

/* ---------- Icons (all aria-hidden, 1.8-stroke family) ---------- */

function DownloadGlyph({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={`h-5 w-5 ${className}`}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function ArrowGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

function ShieldGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function WindowsGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M3 5.5 11 4.4v7.1H3V5.5Zm0 13L11 19.6v-7H3v6Zm9-14.3L21 3v8.5h-9V4.2Zm0 16.1L21 21v-8.5h-9v7.8Z" />
    </svg>
  );
}

function CodeGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 8-4 4 4 4" />
      <path d="m16 8 4 4-4 4" />
      <path d="m13 6-2 12" />
    </svg>
  );
}

function NoAccountGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 19a4 4 0 0 0-8 0" />
      <circle cx="12" cy="9" r="3" />
      <path d="m4 4 16 16" />
    </svg>
  );
}

function BundleGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4 7.5 8 4.5 8-4.5" />
      <path d="M12 12v9" />
    </svg>
  );
}

function OfflineGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 18a4 4 0 0 1 .9-7.9 5.5 5.5 0 0 1 9.6-2.3" />
      <path d="M17 11a3.5 3.5 0 0 1 1 6.8" />
      <path d="M8 18h8" />
      <path d="m4 4 16 16" />
    </svg>
  );
}

function MicGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0" />
      <path d="M12 17v4" />
      <path d="M9 21h6" />
    </svg>
  );
}

function ChipGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2" />
    </svg>
  );
}

function ClipboardGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <path d="M9 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H9V4Z" />
      <path d="m9 13 2 2 4-4" />
    </svg>
  );
}

function PenGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function AccessibilityGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="4.5" r="1.6" />
      <path d="M4 8.5c2.5 1 5 1.5 8 1.5s5.5-.5 8-1.5" />
      <path d="M12 10v5" />
      <path d="m9 21 3-6 3 6" />
    </svg>
  );
}

function GitHubGlyph({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={`h-5 w-5 ${className}`}>
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.4 9.4 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.79-4.58 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.04 10.04 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function StarGlyph({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`h-3.5 w-3.5 text-[#42caff] ${className}`}
    >
      <path d="m12 2.5 2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.85 6.19 20.9l1.11-6.47-4.7-4.58 6.5-.95L12 2.5Z" />
    </svg>
  );
}

function CheckGlyph({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={`h-5 w-5 ${className}`}
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
  );
}

function DotGlyph({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={`h-5 w-5 ${className}`}>
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PlusGlyph({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={`h-5 w-5 ${className}`}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

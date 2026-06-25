import Image from 'next/image';
import {
  formatReleaseSize,
  getLatestInumakiRelease,
  INUMAKI_RELEASES_URL,
  selectWindowsDownloadAsset,
} from '@/lib/github-release';

export default async function HomePage() {
  const release = await getLatestInumakiRelease({ revalidate: 300, timeoutMs: 3000 }).catch(
    () => null,
  );
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

  const metaChips = [
    { label: 'Version', value: releaseLabel },
    { label: 'Released', value: publishedDate },
    { label: 'Size', value: assetLabel },
    { label: 'Platform', value: 'Windows x64' },
    { label: 'License', value: 'MIT' },
  ];

  // Hand-tuned, organic waveform envelope (not a tiling modulo pattern).
  const waveBars = [
    0.32, 0.55, 0.78, 0.46, 0.9, 0.6, 0.4, 0.72, 0.95, 0.52, 0.34, 0.66, 0.85, 0.48, 0.7, 0.38,
    0.82, 0.58, 0.44, 0.76, 0.92, 0.5, 0.36, 0.68, 0.88, 0.54, 0.42, 0.62,
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0b0f14] text-slate-200 antialiased selection:bg-[#00aeef]/30 selection:text-white">
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
              href={INUMAKI_RELEASES_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="hidden min-h-[44px] items-center rounded-full px-4 text-sm font-medium text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14] sm:inline-flex"
            >
              Release notes
            </a>
            <a
              href="/api/download/latest"
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
                Open source · runs 100% on your machine
              </span>

              <h1 className="mt-7">
                <span
                  className="ink-reveal ink-delay-1 block bg-gradient-to-b from-white via-[#cdeefc] to-[#42caff] bg-clip-text text-5xl font-black leading-none tracking-[0.04em] text-transparent drop-shadow-[0_0_30px_rgba(0,174,239,0.25)] sm:text-7xl"
                  style={{ fontFamily: 'var(--font-orbitron)' }}
                >
                  Inumaki
                </span>
                <span
                  className="ink-reveal ink-delay-2 mt-5 block text-balance text-3xl font-semibold leading-[1.1] text-white sm:text-5xl"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Press a key. Speak.{' '}
                  <span className="text-[#42caff]">Paste clean text</span> anywhere.
                </span>
              </h1>

              <p className="ink-reveal ink-delay-3 mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg lg:mx-0">
                A Windows-first voice-to-text app that lives in your tray. Hit a global hotkey, talk
                in any app, and your words appear right where you were typing — transcribed locally
                with whisper.cpp. Your audio never leaves the machine.
              </p>

              {/* CTAs */}
              <div className="ink-reveal ink-delay-4 mt-9 flex flex-col items-center gap-3 sm:flex-row lg:items-start lg:justify-start">
                <a
                  href="/api/download/latest"
                  className="group inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-full bg-[#00aeef] px-8 text-base font-semibold text-[#04131c] shadow-[0_14px_40px_-12px_rgba(0,174,239,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#42caff] hover:shadow-[0_18px_48px_-12px_rgba(66,202,255,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14] sm:w-auto"
                >
                  <DownloadGlyph className="transition-transform duration-200 group-hover:translate-y-0.5" />
                  Download for Windows
                </a>
                <a
                  href={INUMAKI_RELEASES_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 text-base font-medium text-slate-200 backdrop-blur transition-colors hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14] sm:w-auto"
                >
                  View release notes
                  <ArrowGlyph />
                </a>
              </div>

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
            <div className="ink-reveal ink-delay-3 relative mx-auto w-full max-w-md lg:max-w-none">
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
                  <div className="flex items-center justify-between">
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
                  <div className="mt-7 flex h-24 items-end justify-center gap-[3px] rounded-2xl bg-black/30 px-4 ring-1 ring-white/5 sm:gap-1">
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
                      Pasted into your editor
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-200 sm:text-base">
                      Schedule the design review for Thursday and loop in the team.
                      <span className="ink-caret ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[2px] bg-[#42caff] align-middle" />
                    </p>
                  </div>

                  {/* keycap row */}
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <Keycap>Ctrl</Keycap>
                      <span aria-hidden="true" className="text-slate-400">
                        +
                      </span>
                      <Keycap>Shift</Keycap>
                      <span aria-hidden="true" className="text-slate-400">
                        +
                      </span>
                      <Keycap>Space</Keycap>
                    </div>
                    <span
                      className="text-xs text-slate-400"
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

        {/* ===== TRUST / FEATURE STRIP (hairline-divided) ===== */}
        <section aria-labelledby="trust-heading" className="border-y border-white/[0.06]">
          <h2 id="trust-heading" className="sr-only">
            Why Inumaki
          </h2>
          <div className="mx-auto grid max-w-6xl divide-y divide-white/[0.06] px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0">
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
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section
          aria-labelledby="how-heading"
          className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p
              className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7fdcff]"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              How it works
            </p>
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
              body="Talk like you would to a colleague. whisper.cpp transcribes on device, in real time, fully offline."
            />
            <Step
              n="03"
              title="Paste clean text"
              body="Release the key and polished, punctuated text drops right where your cursor was — in any app."
            />
          </ol>
        </section>

        {/* ===== FINAL CTA BAND ===== */}
        <section
          aria-labelledby="cta-heading"
          className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6"
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
                href="/api/download/latest"
                className="group inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-full bg-[#00aeef] px-8 text-base font-semibold text-[#04131c] shadow-[0_14px_40px_-12px_rgba(0,174,239,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#42caff] hover:shadow-[0_18px_48px_-12px_rgba(66,202,255,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14] sm:w-auto"
              >
                <DownloadGlyph className="transition-transform duration-200 group-hover:translate-y-0.5" />
                Download {releaseLabel}
              </a>
              <a
                href={INUMAKI_RELEASES_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 text-base font-medium text-slate-200 backdrop-blur transition-colors hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14] sm:w-auto"
              >
                View release
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
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/inumaki-icon-dark-transparent.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <div className="leading-tight">
              <p
                className="text-sm font-bold tracking-[0.12em] text-white"
                style={{ fontFamily: 'var(--font-orbitron)' }}
              >
                INUMAKI
              </p>
              <p className="text-xs text-slate-400">Published by Camie Tech · MIT License</p>
            </div>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm"
          >
            <a
              href="https://www.camie.tech"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-h-[44px] items-center rounded text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14]"
            >
              www.camie.tech
            </a>
            <a
              href={INUMAKI_RELEASES_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-h-[44px] items-center rounded text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14]"
            >
              GitHub releases
            </a>
            <a
              href="/api/download/latest"
              className="inline-flex min-h-[44px] items-center rounded text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14]"
            >
              Download
            </a>
          </nav>
        </div>
        <p className="pb-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Camie Tech. Inumaki is open-source software released under the
          MIT License. Audio is transcribed locally and never leaves your device.
        </p>
      </footer>
    </div>
  );
}

/* ---------- Presentational helpers (server-safe, no client hooks) ---------- */

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
    <div className="group py-10 transition-colors duration-300 md:px-8 md:py-14 md:first:pl-0 md:last:pr-0">
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
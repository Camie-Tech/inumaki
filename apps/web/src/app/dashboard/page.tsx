import Link from 'next/link';

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#0b0f14] px-6 py-12 text-slate-200">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.28em] text-[#7fdcff]">
            Inumaki dashboard
          </p>
          <h1 className="text-4xl font-semibold text-white">No sign-in. Just install and talk.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Inumaki is OSS. Open the desktop app, finish the first-run setup, then use the global
            hotkey to dictate into any app.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['1', 'Open the app', 'Launch Inumaki and keep it running in the tray.'],
            ['2', 'Press the hotkey', 'Use Windows+Alt to start and stop dictation.'],
            ['3', 'Paste anywhere', 'Your cleaned text is pasted into the active window.'],
          ].map(([step, title, body]) => (
            <div key={step} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-sm font-mono text-[#7fdcff]">STEP {step}</div>
              <h2 className="mt-3 text-lg font-semibold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold text-white">What you can change</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              Default mode, tone, preview-before-paste, and auto-paste live in the desktop Settings
              panel.
            </div>
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
              If you run your own API, set the server URL during onboarding or later in Settings.
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-[#00aeef] px-5 py-3 text-sm font-semibold text-[#04131c]"
          >
            Back to site
          </Link>
          <a
            href="https://github.com/Camie-Tech/inumaki"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center rounded-full border border-white/12 px-5 py-3 text-sm font-medium text-slate-200"
          >
            View source
          </a>
        </div>
      </div>
    </main>
  );
}

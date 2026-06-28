export default function VerifyPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-violet-500/20 bg-violet-500/10">
          <svg
            className="h-6 w-6 text-violet-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6v12m6-6H6"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-lg font-semibold text-white">No email verification needed</h1>
        <p className="text-sm leading-relaxed text-zinc-400">
          Inumaki OSS does not use magic-link authentication. Open the desktop app and complete
          onboarding instead.
        </p>
        <p className="mt-4 font-mono text-xs text-zinc-600">No inbox step, no account required.</p>
        <a
          href="/dashboard"
          className="mt-6 inline-block text-sm text-violet-400 transition-colors hover:text-violet-300"
        >
          Back to dashboard
        </a>
      </div>
    </main>
  );
}

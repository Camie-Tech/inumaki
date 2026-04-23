// apps/web/src/app/auth/verify/page.tsx
export default function VerifyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-violet-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 className="text-white text-lg font-semibold mb-2">Check your inbox</h1>
        <p className="text-zinc-400 text-sm leading-relaxed">
          We sent you a sign-in link. Click it to access Inumaki AI.
        </p>
        <p className="text-zinc-600 text-xs mt-4 font-mono">
          Didn't get it? Check spam or try again.
        </p>
        <a
          href="/auth/signin"
          className="inline-block mt-6 text-violet-400 text-sm hover:text-violet-300 transition-colors"
        >
          ← Back to sign in
        </a>
      </div>
    </main>
  );
}

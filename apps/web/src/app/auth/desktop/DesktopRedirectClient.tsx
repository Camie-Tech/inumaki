'use client';

import { useEffect, useMemo, useState } from 'react';

interface DesktopRedirectClientProps {
  base: string;
  code: string;
}

export function DesktopRedirectClient({ base, code }: DesktopRedirectClientProps) {
  const [showFallback, setShowFallback] = useState(false);

  const desktopUrl = useMemo(() => {
    const params = new URLSearchParams({ code, base });
    return `inumaki://auth?${params.toString()}`;
  }, [base, code]);

  useEffect(() => {
    window.location.href = desktopUrl;
    const timer = window.setTimeout(() => setShowFallback(true), 1500);
    return () => window.clearTimeout(timer);
  }, [desktopUrl]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-violet-500/20 bg-zinc-950 p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={2}>
            <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" fill="rgb(139,92,246)" stroke="none" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" strokeLinecap="round" stroke="rgb(139,92,246)" />
          </svg>
        </div>

        <h1 className="text-white text-xl font-semibold mb-2">Opening Desktop App</h1>
        <p className="text-zinc-400 text-sm leading-relaxed">
          We&apos;re handing your authenticated browser session to the desktop app now.
        </p>

        {showFallback && (
          <div className="mt-6 space-y-3">
            <a
              href={desktopUrl}
              className="w-full inline-flex items-center justify-center rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold py-2.5 px-4 transition-colors"
            >
              Open Desktop App
            </a>
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
            >
              Back to dashboard
            </a>
          </div>
        )}
      </div>
    </main>
  );
}

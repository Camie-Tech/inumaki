// apps/web/src/app/auth/signin/page.tsx
'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const callbackUrl = searchParams.get('desktop') === '1' ? '/auth/desktop' : '/dashboard';

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await signIn('resend', { email, callbackUrl, redirect: false });
    if (result?.error) {
      setError('Sign-in failed. Make sure this email is allowed.');
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  async function handleGoogle() {
    await signIn('google', { callbackUrl });
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-white"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </div>
            <span className="text-white text-xl font-semibold tracking-tight">Inumaki AI</span>
          </div>
          <p className="text-zinc-400 text-sm">
            Internal voice productivity · Authorized access only
          </p>
        </div>

        {sent ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-5 h-5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-white font-medium mb-1">Check your email</p>
            <p className="text-zinc-400 text-sm">
              We sent a sign-in link to <span className="text-violet-400">{email}</span>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Google */}
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white py-2.5 px-4 text-sm font-medium transition-colors"
            >
              <GoogleIcon />
              Continue with Google Workspace
            </button>

            <div className="relative flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-zinc-600 text-xs">or</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            {/* Magic link */}
            <form onSubmit={handleMagicLink} className="space-y-3">
              <input
                type="email"
                placeholder="your@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600 py-2.5 px-4 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white py-2.5 px-4 text-sm font-medium transition-colors"
              >
                {loading ? 'Sending…' : 'Continue with Email'}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-zinc-600 text-xs mt-8">
          Access restricted to approved internal users
        </p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

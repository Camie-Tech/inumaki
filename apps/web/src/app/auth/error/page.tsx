// apps/web/src/app/auth/error/page.tsx
'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: 'Your email is not on the approved list. Contact an admin to request access.',
  Configuration: 'Auth is misconfigured. Contact your admin.',
  Verification: 'The sign-in link has expired. Please request a new one.',
  Default: 'An error occurred during sign in.',
};

function ErrorContent() {
  const params = useSearchParams();
  const error = params.get('error') ?? 'Default';
  const message = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default;

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>
        <h1 className="text-white text-lg font-semibold mb-2">Access denied</h1>
        <p className="text-zinc-400 text-sm leading-relaxed">{message}</p>
        <a
          href="/auth/signin"
          className="inline-block mt-6 text-violet-400 text-sm hover:text-violet-300 transition-colors"
        >
          ← Try again
        </a>
      </div>
    </main>
  );
}

export default function ErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  );
}

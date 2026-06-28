'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: 'This auth route is no longer used in OSS mode.',
  Configuration: 'This auth route is no longer used in OSS mode.',
  Verification: 'This auth route is no longer used in OSS mode.',
  Default: 'This auth route is no longer used in OSS mode.',
};

function ErrorContent() {
  const params = useSearchParams();
  const error = params.get('error') ?? 'Default';
  const message = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
          <svg
            className="h-6 w-6 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-lg font-semibold text-white">Auth is not part of OSS mode</h1>
        <p className="text-sm leading-relaxed text-zinc-400">{message}</p>
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

export default function ErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  );
}

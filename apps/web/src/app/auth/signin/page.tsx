import Link from 'next/link';

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
        <h1 className="text-2xl font-semibold text-white">No account required</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Inumaki OSS does not use browser sign-in. Open the desktop app and complete onboarding.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Open dashboard
        </Link>
      </div>
    </main>
  );
}

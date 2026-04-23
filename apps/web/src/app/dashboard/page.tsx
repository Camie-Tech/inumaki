import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '../../db';
import { userPreferences, usageLogs } from '../../db/schema';
import { eq, desc, count } from 'drizzle-orm';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');

  const [prefs] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, session.user.id));

  const recentLogs = await db
    .select()
    .from(usageLogs)
    .where(eq(usageLogs.userId, session.user.id))
    .orderBy(desc(usageLogs.createdAt))
    .limit(10);

  const [totalRes] = await db
    .select({ value: count() })
    .from(usageLogs)
    .where(eq(usageLogs.userId, session.user.id));
  const totalUsage = totalRes.value;

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-4 h-4"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"
                fill="rgb(139,92,246)"
                stroke="none"
              />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" strokeLinecap="round" stroke="rgb(139,92,246)" />
            </svg>
          </div>
          <h1 className="text-white text-xl font-semibold tracking-tight">Inumaki AI</h1>
        </div>
        <p className="text-zinc-500 text-sm font-mono">
          {session.user.email} · {session.user.role.toLowerCase()}
        </p>
      </div>

      {/* Desktop connection card */}
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5 mb-8">
        <h2 className="text-white text-sm font-semibold mb-1">Connect Desktop App</h2>
        <p className="text-zinc-400 text-xs mb-4 font-mono leading-relaxed">
          Click the button below to instantly open the Inumaki desktop app as an authenticated user.
        </p>

        <a
          href="/auth/desktop"
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
        >
          Open Desktop App
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total uses', value: totalUsage },
          {
            label: 'Default mode',
            value: prefs?.defaultMode?.toLowerCase().replace('_', ' ') ?? 'clean',
          },
          { label: 'Auto-paste', value: prefs?.autoPaste ? 'on' : 'off' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <div className="text-white text-xl font-semibold mb-1">{stat.value}</div>
            <div className="text-zinc-500 text-xs font-mono">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent logs */}
      {recentLogs.length > 0 && (
        <div>
          <h2 className="text-zinc-400 text-xs font-mono uppercase tracking-widest mb-3">
            Recent Activity
          </h2>
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            {recentLogs.map((log, i) => (
              <div
                key={log.id}
                className={`flex items-center gap-4 px-4 py-3 text-sm ${i < recentLogs.length - 1 ? 'border-b border-zinc-800/60' : ''}`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${log.success ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <span className="text-zinc-300 font-mono text-xs flex-1">
                  {log.mode.toLowerCase().replace('_', ' ')}
                </span>
                <span className="text-zinc-600 font-mono text-xs">
                  {log.audioDurationSeconds.toFixed(1)}s
                </span>
                <span className="text-zinc-700 font-mono text-xs">
                  {new Date(log.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin link */}
      {session.user.role === 'ADMIN' && (
        <div className="mt-8">
          <a
            href="/admin"
            className="inline-flex items-center gap-2 text-violet-400 text-sm hover:text-violet-300 transition-colors font-mono"
          >
            Admin panel →
          </a>
        </div>
      )}
    </main>
  );
}

'use client';
// apps/web/src/app/admin/AdminClient.tsx

import { useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: { usageLogs: number };
}

interface Invite {
  id: string;
  email: string;
  status: string;
  createdAt: string;
}

interface Stats {
  total: number;
  active: number;
  logs: number;
  successLogs: number;
}

interface Props {
  users: User[];
  invites: Invite[];
  stats: Stats;
}

export function AdminClient({ users: initialUsers, invites: initialInvites, stats }: Props) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [invites, setInvites] = useState<Invite[]>(initialInvites);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteStatus, setInviteStatus] = useState('');
  const [tab, setTab] = useState<'users' | 'invites'>('users');

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteStatus('');
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });
      if (!res.ok) throw new Error('Failed');
      const invite = await res.json();
      setInvites((prev) => [invite, ...prev.filter((i) => i.email !== invite.email)]);
      setInviteEmail('');
      setInviteStatus('Invite sent!');
    } catch {
      setInviteStatus('Failed to invite. Check the email.');
    } finally {
      setInviting(false);
    }
  }

  async function toggleActive(userId: string, isActive: boolean) {
    const res = await fetch('/api/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isActive: !isActive }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: !isActive } : u)));
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-semibold">Admin</h1>
          <p className="text-zinc-500 text-xs font-mono mt-1">Inumaki AI · Internal</p>
        </div>
        <a
          href="/dashboard"
          className="text-zinc-500 text-xs hover:text-zinc-300 font-mono transition-colors"
        >
          ← Dashboard
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Users', value: stats.total },
          { label: 'Active', value: stats.active },
          { label: 'Total runs', value: stats.logs },
          {
            label: 'Success rate',
            value: stats.logs ? `${Math.round((stats.successLogs / stats.logs) * 100)}%` : '—',
          },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
            <div className="text-white text-lg font-semibold">{s.value}</div>
            <div className="text-zinc-600 text-xs font-mono">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Invite form */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 mb-6">
        <h2 className="text-white text-sm font-semibold mb-3">Invite User</h2>
        <form onSubmit={handleInvite} className="flex gap-3">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="user@company.com"
            required
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-600 py-2 px-3 text-sm font-mono focus:outline-none focus:border-violet-500 transition-colors"
          />
          <button
            type="submit"
            disabled={inviting}
            className="rounded-lg border border-violet-500/40 bg-violet-500/10 text-violet-300 px-4 py-2 text-sm hover:bg-violet-500/20 transition-colors disabled:opacity-50"
          >
            {inviting ? 'Sending…' : 'Invite'}
          </button>
        </form>
        {inviteStatus && (
          <p
            className={`text-xs font-mono mt-2 ${inviteStatus.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}
          >
            {inviteStatus}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-zinc-900/50 rounded-lg p-1 w-fit">
        {(['users', 'invites'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-xs font-mono transition-colors ${
              tab === t ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t} {t === 'users' ? `(${users.length})` : `(${invites.length})`}
          </button>
        ))}
      </div>

      {/* Users table */}
      {tab === 'users' && (
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          {users.map((user, i) => (
            <div
              key={user.id}
              className={`flex items-center gap-4 px-4 py-3 ${
                i < users.length - 1 ? 'border-b border-zinc-800/60' : ''
              } ${!user.isActive ? 'opacity-40' : ''}`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${user.isActive ? 'bg-green-500' : 'bg-zinc-600'}`}
              />

              <div className="flex-1 min-w-0">
                <div className="text-white text-sm truncate">{user.email}</div>
                <div className="text-zinc-600 text-xs font-mono">
                  {user.role.toLowerCase()} · {user._count.usageLogs} uses ·{' '}
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>

              <button
                onClick={() => toggleActive(user.id, user.isActive)}
                className={`text-xs font-mono px-3 py-1 rounded-md border transition-colors ${
                  user.isActive
                    ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                    : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                }`}
              >
                {user.isActive ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Invites table */}
      {tab === 'invites' && (
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          {invites.length === 0 && (
            <div className="px-4 py-8 text-center text-zinc-600 text-sm font-mono">
              No invites yet
            </div>
          )}
          {invites.map((invite, i) => (
            <div
              key={invite.id}
              className={`flex items-center gap-4 px-4 py-3 ${i < invites.length - 1 ? 'border-b border-zinc-800/60' : ''}`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  invite.status === 'ACCEPTED'
                    ? 'bg-green-500'
                    : invite.status === 'PENDING'
                      ? 'bg-yellow-500'
                      : 'bg-zinc-600'
                }`}
              />
              <div className="flex-1 font-mono text-sm text-zinc-300">{invite.email}</div>
              <span className="text-xs font-mono text-zinc-500">{invite.status.toLowerCase()}</span>
              <span className="text-xs font-mono text-zinc-700">
                {new Date(invite.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

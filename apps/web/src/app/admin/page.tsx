// apps/web/src/app/admin/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '../../db';
import { users as usersSchema, invites as invitesSchema, usageLogs } from '../../db/schema';
import { eq, desc, count as dCount, sql } from 'drizzle-orm';
import { AdminClient } from './AdminClient';

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/signin');
  if (session.user.role !== 'ADMIN') redirect('/dashboard');

  const [users, invites, stats] = await Promise.all([
    db
      .select({
        id: usersSchema.id,
        email: usersSchema.email,
        name: usersSchema.name,
        role: usersSchema.role,
        isActive: usersSchema.isActive,
        createdAt: usersSchema.createdAt,
        _count: { usageLogs: dCount(usageLogs.id) },
      })
      .from(usersSchema)
      .leftJoin(usageLogs, eq(usageLogs.userId, usersSchema.id))
      .groupBy(usersSchema.id)
      .orderBy(desc(usersSchema.createdAt)),
    db.select().from(invitesSchema).orderBy(desc(invitesSchema.createdAt)),
    Promise.all([
      db
        .select({ value: dCount() })
        .from(usersSchema)
        .then((res) => res[0].value),
      db
        .select({ value: dCount() })
        .from(usersSchema)
        .where(eq(usersSchema.isActive, true))
        .then((res) => res[0].value),
      db
        .select({ value: dCount() })
        .from(usageLogs)
        .then((res) => res[0].value),
      db
        .select({ value: dCount() })
        .from(usageLogs)
        .where(eq(usageLogs.success, true))
        .then((res) => res[0].value),
    ]).then(([total, active, logs, successLogs]) => ({
      total,
      active,
      logs,
      successLogs,
    })),
  ]);

  return <AdminClient users={users as any} invites={invites as any} stats={stats} />;
}

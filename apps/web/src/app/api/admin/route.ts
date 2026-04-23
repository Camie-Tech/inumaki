// apps/web/src/app/api/admin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '../../../db';
import { users, usageLogs, invites } from '../../../db/schema';
import { eq, desc, count as dCount } from 'drizzle-orm';
import { z } from 'zod';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (session.user.role !== 'ADMIN') return null;
  return session;
}

// GET /api/admin — stats + user list
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [totalUsers, activeUsers, totalLogs, recentLogs, usersList, invitesList] =
    await Promise.all([
      db
        .select({ value: dCount() })
        .from(users)
        .then((res) => res[0].value),
      db
        .select({ value: dCount() })
        .from(users)
        .where(eq(users.isActive, true))
        .then((res) => res[0].value),
      db
        .select({ value: dCount() })
        .from(usageLogs)
        .then((res) => res[0].value),
      db
        .select({
          id: usageLogs.id,
          createdAt: usageLogs.createdAt,
          mode: usageLogs.mode,
          audioDurationSeconds: usageLogs.audioDurationSeconds,
          success: usageLogs.success,
          errorCode: usageLogs.errorCode,
          user: { email: users.email, name: users.name },
        })
        .from(usageLogs)
        .leftJoin(users, eq(usageLogs.userId, users.id))
        .orderBy(desc(usageLogs.createdAt))
        .limit(20),
      db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          isActive: users.isActive,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt)),
      db.select().from(invites).orderBy(desc(invites.createdAt)),
    ]);

  return NextResponse.json({
    stats: { totalUsers, activeUsers, totalLogs },
    recentLogs,
    users: usersList,
    invites: invitesList,
  });
}

const inviteSchema = z.object({ email: z.string().email() });

// POST /api/admin — invite user
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = inviteSchema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });

  const [invite] = await db
    .insert(invites)
    .values({ email: body.data.email, invitedById: session.user.id })
    .onConflictDoUpdate({
      target: invites.email,
      set: { status: 'PENDING', invitedById: session.user.id },
    })
    .returning();

  return NextResponse.json(invite, { status: 201 });
}

// PATCH /api/admin — toggle user active status
export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { userId, isActive } = await req.json();
  if (!userId || typeof isActive !== 'boolean') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const [user] = await db
    .update(users)
    .set({ isActive })
    .where(eq(users.id, userId))
    .returning({ id: users.id, email: users.email, isActive: users.isActive });

  return NextResponse.json(user);
}

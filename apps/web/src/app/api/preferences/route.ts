// apps/web/src/app/api/preferences/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '../../../db';
import { userPreferences } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateSchema = z.object({
  defaultMode: z.enum(['RAW', 'CLEAN', 'POLISHED', 'CODING_PROMPT']).optional(),
  autoPaste: z.boolean().optional(),
  previewBeforePaste: z.boolean().optional(),
  hotkey: z.string().min(3).optional(),
  microphoneId: z.string().nullable().optional(),
  tonePreference: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [prefs] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, session.user.id));

  return NextResponse.json(prefs);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let updates: z.infer<typeof updateSchema>;
  try {
    updates = updateSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const [prefs] = await db
    .insert(userPreferences)
    .values({ userId: session.user.id, ...updates })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: updates,
    })
    .returning();

  return NextResponse.json(prefs);
}

// apps/web/src/app/api/process/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '../../../db';
import { users, userPreferences, usageLogs } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { transcribeAudio, rewriteTranscript } from '@/lib/openai';
import type { ProcessAudioRequest, ProcessAudioResponse } from '@inumaki/shared';
import { z } from 'zod';
import { extractBearerToken, getUserFromSessionToken } from '@/lib/session-token';

const schema = z.object({
  audioBase64: z.string().min(1),
  mimeType: z.string().default('audio/webm'),
  durationSeconds: z.number().min(0).max(300),
  mode: z.enum(['raw', 'clean', 'polished', 'coding_prompt']).default('clean'),
  tonePreference: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const bearerToken = extractBearerToken(req);
  const desktopUser = bearerToken ? await getUserFromSessionToken(bearerToken) : null;
  const session = desktopUser ? null : await auth();
  const userId = desktopUser?.id ?? session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [userRecord] = await db.select().from(users).where(eq(users.id, userId));
  const [preferences] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId));
  const user = { ...userRecord, preferences };

  if (!user?.isActive) {
    return NextResponse.json({ error: 'Account inactive' }, { status: 403 });
  }

  let body: ProcessAudioRequest;
  try {
    body = schema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { audioBase64, mimeType, durationSeconds, mode, tonePreference } = body;
  const tone = tonePreference ?? user.preferences?.tonePreference ?? 'neutral';

  let transcript = '';
  let output = '';
  let success = false;
  let errorCode: string | null = null;

  try {
    // 1. Decode base64 audio
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    // 2. Transcribe with Whisper
    transcript = await transcribeAudio(audioBuffer, mimeType);

    // 3. Rewrite with GPT
    output = await rewriteTranscript(transcript, mode, tone);

    success = true;
  } catch (err: any) {
    console.error('[process] error:', err);
    errorCode = err?.code ?? err?.type ?? 'UNKNOWN_ERROR';
    return NextResponse.json({ error: 'Processing failed', code: errorCode }, { status: 500 });
  } finally {
    // 4. Log usage (fire-and-forget)
    db.insert(usageLogs)
      .values({
        userId,
        mode: mode.toUpperCase() as any,
        audioDurationSeconds: durationSeconds,
        success,
        errorCode,
      })
      .execute()
      .catch(console.error);
  }

  const response: ProcessAudioResponse = { transcript, output, mode };
  return NextResponse.json(response);
}

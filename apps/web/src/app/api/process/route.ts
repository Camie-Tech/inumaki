// apps/web/src/app/api/process/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio, rewriteTranscript } from '@/lib/openai';
import type { ProcessAudioRequest, ProcessAudioResponse } from '@inumaki/shared';
import { z } from 'zod';

const schema = z.object({
  audioBase64: z.string().min(1),
  mimeType: z.string().default('audio/webm'),
  durationSeconds: z.number().min(0).max(300),
  mode: z.enum(['raw', 'clean', 'polished', 'coding_prompt']).default('clean'),
  tonePreference: z.string().optional(),
});

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy_key_for_build') {
    return NextResponse.json(
      { error: 'Transcription backend is not configured', code: 'OPENAI_API_KEY_MISSING' },
      { status: 503 }
    );
  }

  let body: ProcessAudioRequest;
  try {
    body = schema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { audioBase64, mimeType, durationSeconds, mode, tonePreference } = body;
  const tone = tonePreference ?? 'neutral';

  let transcript = '';
  let output = '';

  try {
    // 1. Decode base64 audio
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    // 2. Transcribe with Whisper
    transcript = await transcribeAudio(audioBuffer, mimeType);

    // 3. Rewrite with GPT
    output = await rewriteTranscript(transcript, mode, tone);
  } catch (err: any) {
    console.error('[process] error:', err);
    const errorCode = err?.code ?? err?.type ?? 'UNKNOWN_ERROR';
    const status = errorCode === 'invalid_api_key' ? 503 : 500;
    const error =
      errorCode === 'invalid_api_key'
        ? 'Transcription backend rejected its API key'
        : 'Processing failed';
    return NextResponse.json({ error, code: errorCode }, { status });
  }

  const response: ProcessAudioResponse = { transcript, output, mode };
  return NextResponse.json(response);
}

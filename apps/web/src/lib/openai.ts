// apps/web/src/lib/openai.ts
import OpenAI from 'openai';
import type { OutputMode } from '@inumaki/shared';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build',
});

// ─── Transcription ────────────────────────────────────────────────

export async function transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
  // Convert buffer to File object for OpenAI SDK
  const file = new File([audioBuffer as any], `audio.${getExtension(mimeType)}`, {
    type: mimeType,
  });

  const response = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    response_format: 'text',
    language: 'en',
  });

  return typeof response === 'string' ? response : ((response as any).text ?? '');
}

// ─── Rewrite / Cleanup ────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<OutputMode, string> = {
  raw: `You are a transcription cleaner. Fix only obvious transcription errors (wrong words, clear mishearing). 
Do NOT rephrase, reorder, or improve the text. Return only the corrected transcript with no explanation.`,

  clean: `You are a text cleanup assistant. Given a raw speech transcript:
- Remove filler words (um, uh, like, you know, basically, literally, etc.)
- Fix punctuation and capitalization
- Break into natural sentences
- Do NOT change meaning, word choice, or rephrase substantially
Return only the cleaned text with no explanation.`,

  polished: `You are a professional communication editor. Given a raw speech transcript, rewrite it as a polished, concise message:
- Professional and clear tone
- Remove redundancy and filler
- Preserve the core message and intent
- Suitable for Slack, email, or documentation
Return only the polished output with no explanation.`,

  coding_prompt: `You are a technical prompt engineer. Given a raw speech transcript of a developer explaining what they want to build or fix, rewrite it as a structured, precise coding prompt:
- Start with a clear task description
- List specific requirements as bullet points
- Include relevant constraints or context
- Use technical vocabulary appropriately
- Suitable for pasting directly into an AI coding assistant (Cursor, Copilot, Claude)
Return only the structured prompt with no explanation.`,
};

export async function rewriteTranscript(
  transcript: string,
  mode: OutputMode,
  tonePreference: string = 'neutral'
): Promise<string> {
  if (mode === 'raw') {
    // Minimal processing for raw mode
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.raw },
        { role: 'user', content: transcript },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });
    return response.choices[0]?.message?.content?.trim() ?? transcript;
  }

  const toneNote = tonePreference !== 'neutral' ? `\n\nTone preference: ${tonePreference}` : '';

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPTS[mode] + toneNote,
      },
      { role: 'user', content: transcript },
    ],
    temperature: mode === 'coding_prompt' ? 0.2 : 0.5,
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content?.trim() ?? transcript;
}

// ─── Helpers ──────────────────────────────────────────────────────

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/mp4': 'mp4',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/flac': 'flac',
    'audio/x-m4a': 'm4a',
  };
  return map[mimeType] ?? 'webm';
}

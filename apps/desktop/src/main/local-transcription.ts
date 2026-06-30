import { app } from 'electron';
import { execFile } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import type { OutputMode, ProcessAudioRequest, ProcessAudioResponse } from '@inumaki/shared';

const execFileAsync = promisify(execFile);
const MAX_PROCESS_BUFFER = 1024 * 1024 * 20;
const WHISPER_TIMEOUT_MS = 120_000;

interface WhisperAssets {
  binaryPath: string;
  modelPath: string;
}

interface ExecFileError extends Error {
  killed?: boolean;
  stderr?: string;
}

let cachedAssets: WhisperAssets | null = null;

export async function processAudioLocally(
  request: ProcessAudioRequest
): Promise<ProcessAudioResponse> {
  const assets = resolveWhisperAssets();
  const tempDir = path.join(app.getPath('temp'), 'inumaki');
  await mkdir(tempDir, { recursive: true });

  const id = crypto.randomUUID();
  const outputBase = path.join(tempDir, id);
  const audioPath = `${outputBase}.wav`;
  const textPath = `${outputBase}.txt`;

  try {
    if (!isWavMime(request.mimeType)) {
      throw new Error(`Local transcription requires WAV audio, got ${request.mimeType}`);
    }

    await writeFile(audioPath, Buffer.from(request.audioBase64, 'base64'));
    await runWhisperCli(assets, audioPath, outputBase);

    const transcript = (await readFile(textPath, 'utf8')).trim();
    const output = rewriteTranscriptLocally(
      transcript,
      request.mode,
      request.tonePreference ?? 'neutral'
    );

    return {
      transcript,
      output,
      mode: request.mode,
    };
  } finally {
    await unlink(audioPath).catch(() => undefined);
    await unlink(textPath).catch(() => undefined);
  }
}

function resolveWhisperAssets(): WhisperAssets {
  if (cachedAssets) return cachedAssets;

  const roots = whisperRoots();
  const binaryPath = firstExistingFile(
    roots.flatMap((root) =>
      whisperBinaryNames().flatMap((name) => [path.join(root, 'bin', name), path.join(root, name)])
    )
  );
  const modelPath = firstExistingFile(
    roots.flatMap((root) => [
      path.join(root, 'models', modelFileName()),
      path.join(root, modelFileName()),
    ])
  );

  if (!binaryPath || !modelPath) {
    const checked = roots.length > 0 ? roots.join('; ') : 'no candidate directories';
    throw new Error(`Local whisper.cpp assets are missing. Checked: ${checked}`);
  }

  cachedAssets = { binaryPath, modelPath };
  return cachedAssets;
}

async function runWhisperCli(
  assets: WhisperAssets,
  wavPath: string,
  outputBase: string
): Promise<void> {
  const binaryDir = path.dirname(assets.binaryPath);

  try {
    await execFileAsync(
      assets.binaryPath,
      [
        '-m',
        assets.modelPath,
        '-f',
        wavPath,
        '-otxt',
        '-of',
        outputBase,
        '-t',
        String(whisperThreads()),
      ],
      {
        cwd: binaryDir,
        env: {
          ...process.env,
          PATH: `${binaryDir}${path.delimiter}${process.env.PATH ?? ''}`,
        },
        maxBuffer: MAX_PROCESS_BUFFER,
        timeout: WHISPER_TIMEOUT_MS,
        windowsHide: true,
      }
    );
  } catch (error) {
    if (isExecFileError(error) && error.killed) {
      throw new Error(`Local transcription timed out after ${WHISPER_TIMEOUT_MS / 1000} seconds`);
    }

    if (isExecFileError(error) && error.stderr?.trim()) {
      throw new Error(`Local transcription failed: ${error.stderr.trim().slice(0, 500)}`);
    }

    throw error;
  }
}

function rewriteTranscriptLocally(
  transcript: string,
  mode: OutputMode,
  _tonePreference: string
): string {
  const normalized = normalizeWhitespace(transcript);

  if (mode === 'raw') return normalized;

  const cleaned = cleanTranscript(normalized);

  if (mode === 'coding_prompt') {
    return [
      'Goal:',
      cleaned,
      '',
      'Requirements:',
      '- Preserve the intended behavior.',
      '- Keep the implementation scoped and testable.',
      '',
      'Acceptance criteria:',
      '- The requested change works in the target workflow.',
      '- Relevant validation passes.',
    ].join('\n');
  }

  return cleaned;
}

function cleanTranscript(value: string): string {
  const cleaned = normalizeWhitespace(value)
    .replace(/\b(um|uh|hmm|mm|like|you know|basically|literally)\b,?\s*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (!cleaned) return cleaned;

  const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function whisperRoots(): string[] {
  const roots: string[] = [];
  const add = (value: string | undefined) => {
    if (value) roots.push(path.resolve(value));
  };

  add(process.env.INUMAKI_WHISPER_DIR);

  if (process.resourcesPath) {
    add(path.join(process.resourcesPath, 'whisper'));
  }

  const repoRoot = findRepoRoot(__dirname) ?? findRepoRoot(process.cwd());
  if (repoRoot) {
    add(path.join(repoRoot, 'apps', 'desktop', 'resources', 'whisper'));
    add(
      path.join(
        repoRoot,
        'releases',
        'inumaki-oss',
        'Inumaki-AI-0.1.1-win-unpacked',
        'win-unpacked',
        'resources',
        'whisper'
      )
    );
  }

  return Array.from(new Set(roots));
}

function whisperBinaryNames(): string[] {
  return process.platform === 'win32' ? ['whisper-cli.exe', 'main.exe'] : ['whisper-cli', 'main'];
}

function modelFileName(): string {
  const modelName = process.env.WHISPER_CPP_MODEL || 'base.en';
  return `ggml-${modelName}.bin`;
}

function whisperThreads(): number {
  const configured = Number(process.env.WHISPER_CPP_THREADS);
  if (Number.isInteger(configured) && configured > 0) return configured;
  return Math.min(8, Math.max(1, os.availableParallelism() - 1));
}

function firstExistingFile(candidates: string[]): string | null {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

function findRepoRoot(start: string): string | null {
  let current = path.resolve(start);
  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, 'pnpm-workspace.yaml'))) return current;
    current = path.dirname(current);
  }
  return null;
}

function isWavMime(mimeType: string): boolean {
  return mimeType === 'audio/wav' || mimeType === 'audio/wave' || mimeType === 'audio/x-wav';
}

function isExecFileError(error: unknown): error is ExecFileError {
  return error instanceof Error;
}

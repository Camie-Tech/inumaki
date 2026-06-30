// apps/desktop/src/renderer/src/hooks/useRecorder.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import type {
  OutputMode,
  ProcessAudioRequest,
  ProcessAudioResponse,
  RecordingState,
} from '@inumaki/shared';

interface RecorderOptions {
  apiBase: string;
  mode: OutputMode;
  tonePreference: string;
  onResult: (res: ProcessAudioResponse) => void;
  onError: (msg: string) => void;
}

const PROCESS_TIMEOUT_MS = 90_000;

export function useRecorder(opts: RecorderOptions) {
  const [state, setState] = useState<RecordingState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startTimer = () => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = useCallback(async () => {
    // Guard against double-start (e.g. global hotkey + in-window key handler).
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mr = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.start(100); // collect chunks every 100ms
      setState('recording');
      setElapsed(0);
      startTimer();
    } catch (err: unknown) {
      opts.onError(errorMessage(err) ?? 'Microphone access denied');
      setState('error');
    }
  }, []);

  // Listen for the main process (global hotkey) requesting a START. Declared
  // after startRecording so its dependency reference is initialized.
  useEffect(() => {
    const cleanup = window.electronAPI?.onStartRecording?.(() => {
      startRecording();
    });
    return cleanup;
  }, [startRecording]);

  const handleStopAndProcess = useCallback(async () => {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state === 'inactive') return;

    stopTimer();
    const durationSeconds = (Date.now() - startTimeRef.current) / 1000;

    // Stop recording and collect all chunks
    await new Promise<void>((resolve) => {
      mr.onstop = () => resolve();
      mr.stop();
    });

    streamRef.current?.getTracks().forEach((t) => t.stop());

    if (chunksRef.current.length === 0) {
      opts.onError('No audio captured');
      setState('error');
      window.electronAPI?.sendProcessResult?.('error', 'No audio captured');
      return;
    }

    setState('processing');

    // Convert to WAV for local whisper.cpp processing, then base64 encode.
    const mimeType = chunksRef.current[0].type || 'audio/webm';
    const blob = new Blob(chunksRef.current, { type: mimeType });

    try {
      const processAudio = window.electronAPI?.processAudio as
        | ((request: ProcessAudioRequest) => Promise<ProcessAudioResponse>)
        | undefined;
      const processBlob = processAudio ? await convertBlobToWav(blob) : blob;
      const request: ProcessAudioRequest = {
        audioBase64: await blobToBase64(processBlob),
        mimeType: processBlob.type || mimeType,
        durationSeconds,
        mode: opts.mode,
        tonePreference: opts.tonePreference,
      };

      const data = processAudio
        ? await processAudio(request)
        : await processAudioOverHttp(opts.apiBase, request);

      opts.onResult(data);
      setState('success');
      window.electronAPI?.sendProcessResult?.('success');

      // Reset to idle after 3s
      setTimeout(() => setState('idle'), 3000);
    } catch (err: unknown) {
      const msg =
        errorName(err) === 'AbortError'
          ? 'Processing timed out after 90 seconds'
          : (errorMessage(err) ?? 'Processing failed');
      opts.onError(msg);
      setState('error');
      window.electronAPI?.sendProcessResult?.('error', msg);
      setTimeout(() => setState('idle'), 4000);
    }
  }, [opts]);

  // Listen for main process requesting a stop (hotkey release). Keep this after
  // handleStopAndProcess so the IPC listener is refreshed with current settings.
  useEffect(() => {
    const cleanup = window.electronAPI?.onProcessAudio?.(() => {
      handleStopAndProcess();
    });
    return cleanup;
  }, [handleStopAndProcess]);

  const stopRecording = useCallback(() => {
    handleStopAndProcess();
  }, [handleStopAndProcess]);

  const isRecording = state === 'recording';

  return { state, elapsed, startRecording, stopRecording, isRecording };
}

function normalizeApiBase(value: string): string {
  const cleaned = value.trim().replace(/\/+$/, '');
  return cleaned || 'http://localhost:3000';
}

async function processAudioOverHttp(
  apiBaseValue: string,
  request: ProcessAudioRequest
): Promise<ProcessAudioResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROCESS_TIMEOUT_MS);

  try {
    const apiBase = normalizeApiBase(apiBaseValue);
    const res = await fetch(`${apiBase}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(formatBackendError(res.status, err));
    }

    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function blobToBase64(blob: Blob): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read audio'));
    reader.readAsDataURL(blob);
  });

  return dataUrl.split(',', 2)[1] ?? '';
}

async function convertBlobToWav(blob: Blob): Promise<Blob> {
  const audioContext = new AudioContext();

  try {
    const decoded = await audioContext.decodeAudioData(await blob.arrayBuffer());
    const wavBuffer = await resampleToMono(decoded, 16_000);
    const wavBytes = encodeWavPcm16(wavBuffer.getChannelData(0), 16_000);
    return new Blob([wavBytes], { type: 'audio/wav' });
  } finally {
    await audioContext.close().catch(() => undefined);
  }
}

async function resampleToMono(buffer: AudioBuffer, sampleRate: number): Promise<AudioBuffer> {
  const frameCount = Math.max(1, Math.ceil(buffer.duration * sampleRate));
  const offline = new OfflineAudioContext(1, frameCount, sampleRate);
  const source = offline.createBufferSource();
  source.buffer = buffer;
  source.connect(offline.destination);
  source.start(0);
  return offline.startRendering();
}

function encodeWavPcm16(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const bytesPerSample = 2;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (const sample of samples) {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += bytesPerSample;
  }

  return buffer;
}

function writeAscii(view: DataView, offset: number, value: string): void {
  for (let i = 0; i < value.length; i += 1) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

function formatBackendError(status: number, payload: unknown): string {
  const body =
    payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const code = typeof body.code === 'string' ? body.code : '';
  const error = typeof body.error === 'string' ? body.error : '';

  if (code === 'invalid_api_key' || code === 'OPENAI_API_KEY_MISSING') {
    return 'Backend OpenAI API key is missing or invalid';
  }

  if (code) return `${error || 'Processing failed'} (${code})`;
  return error || `Processing failed (HTTP ${status})`;
}

function errorMessage(error: unknown): string | undefined {
  return error instanceof Error ? error.message : undefined;
}

function errorName(error: unknown): string | undefined {
  return error instanceof Error ? error.name : undefined;
}

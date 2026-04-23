// apps/desktop/src/renderer/src/hooks/useRecorder.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import type { OutputMode, RecordingState, ProcessAudioResponse } from '@inumaki/shared';

interface RecorderOptions {
  apiBase: string;
  authToken: string;
  mode: OutputMode;
  tonePreference: string;
  onResult: (res: ProcessAudioResponse) => void;
  onError: (msg: string) => void;
}

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

  // Listen for main process requesting a stop (hotkey release)
  useEffect(() => {
    const cleanup = window.electronAPI?.onProcessAudio?.((data) => {
      // Main process signalled to stop + process
      handleStopAndProcess();
    });
    return cleanup;
  }, [opts.mode, opts.tonePreference]);

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
    } catch (err: any) {
      opts.onError(err?.message ?? 'Microphone access denied');
      setState('error');
    }
  }, []);

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

    // Convert to base64
    const mimeType = chunksRef.current[0].type || 'audio/webm';
    const blob = new Blob(chunksRef.current, { type: mimeType });
    const arrayBuffer = await blob.arrayBuffer();
    const audioBase64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // Send to backend
    try {
      const res = await fetch(`${opts.apiBase}/api/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${opts.authToken}`,
        },
        body: JSON.stringify({
          audioBase64,
          mimeType,
          durationSeconds,
          mode: opts.mode,
          tonePreference: opts.tonePreference,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const data: ProcessAudioResponse = await res.json();
      opts.onResult(data);
      setState('success');
      window.electronAPI?.sendProcessResult?.('success');

      // Reset to idle after 3s
      setTimeout(() => setState('idle'), 3000);
    } catch (err: any) {
      const msg = err?.message ?? 'Processing failed';
      opts.onError(msg);
      setState('error');
      window.electronAPI?.sendProcessResult?.('error', msg);
      setTimeout(() => setState('idle'), 4000);
    }
  }, [opts]);

  const stopRecording = useCallback(() => {
    handleStopAndProcess();
  }, [handleStopAndProcess]);

  const isRecording = state === 'recording';

  return { state, elapsed, startRecording, stopRecording, isRecording };
}

// apps/desktop/src/renderer/src/pages/MainPanel.tsx
import { useState, useEffect, useCallback } from 'react';
import { useRecorder } from '../hooks/useRecorder';
import { useStore } from '../hooks/useStore';
import { ModeSelector } from '../components/ModeSelector';
import { RecordButton } from '../components/RecordButton';
import { OutputDisplay } from '../components/OutputDisplay';
import { StatusBar } from '../components/StatusBar';
import type { OutputMode, ProcessAudioResponse } from '@inumaki/shared';

interface MainPanelProps {
  onShowPreview: (data: { transcript: string; output: string; mode: string }) => void;
}

export function MainPanel({ onShowPreview }: MainPanelProps) {
  const { get, set } = useStore();
  const [mode, setMode] = useState<OutputMode>('clean');
  const [tonePreference, setTonePreference] = useState('neutral');
  const [autoPaste, setAutoPaste] = useState(true);
  const [previewBeforePaste, setPreviewBeforePaste] = useState(false);
  const [apiBase, setApiBase] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [lastResult, setLastResult] = useState<ProcessAudioResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Load preferences from store
  useEffect(() => {
    Promise.all([
      get('defaultMode'),
      get('tonePreference'),
      get('autoPaste'),
      get('previewBeforePaste'),
      get('apiBase'),
      get('authToken'),
    ]).then(([m, tone, ap, pp, base, token]) => {
      if (m) setMode(m as OutputMode);
      if (tone) setTonePreference(tone as string);
      if (ap !== undefined) setAutoPaste(ap as boolean);
      if (pp !== undefined) setPreviewBeforePaste(pp as boolean);
      setApiBase((base as string) || 'http://localhost:3000');
      setAuthToken((token as string) || '');
    });
  }, []);

  const handleResult = useCallback(
    (res: ProcessAudioResponse) => {
      setLastResult(res);
      setErrorMessage('');

      if (previewBeforePaste) {
        onShowPreview({
          transcript: res.transcript,
          output: res.output,
          mode: res.mode,
        });
        return;
      }

      if (autoPaste) {
        window.electronAPI?.pasteText?.(res.output);
      } else {
        window.electronAPI?.copyText?.(res.output);
      }
    },
    [autoPaste, previewBeforePaste, onShowPreview]
  );

  const handleError = useCallback((msg: string) => {
    setErrorMessage(msg);
  }, []);

  const { state, elapsed, startRecording, stopRecording } = useRecorder({
    apiBase,
    authToken,
    mode,
    tonePreference,
    onResult: handleResult,
    onError: handleError,
  });

  // Handle keyboard shortcut in renderer (fallback if main process hotkey doesn't fire)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'Space') {
        e.preventDefault();
        if (state === 'recording') stopRecording();
        else if (state === 'idle' || state === 'success') startRecording();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state, startRecording, stopRecording]);

  const handleModeChange = (m: OutputMode) => {
    setMode(m);
    set('defaultMode', m);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '16px',
        gap: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Mode selector */}
      <ModeSelector value={mode} onChange={handleModeChange} />

      {/* Record button + waveform */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RecordButton
          state={state}
          elapsed={elapsed}
          onStart={startRecording}
          onStop={stopRecording}
        />
      </div>

      {/* Output / status */}
      <div style={{ minHeight: 120 }}>
        {errorMessage && state === 'error' && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              marginBottom: 8,
            }}
          >
            ⚠ {errorMessage}
          </div>
        )}

        {lastResult && (
          <OutputDisplay
            result={lastResult}
            onCopy={() => window.electronAPI?.copyText?.(lastResult.output)}
            onPaste={() => window.electronAPI?.pasteText?.(lastResult.output)}
            onRetry={startRecording}
          />
        )}
      </div>

      {/* Status bar */}
      <StatusBar state={state} mode={mode} autoPaste={autoPaste} />
    </div>
  );
}

// apps/desktop/src/renderer/src/components/RecordButton.tsx
import type { RecordingState } from '@inumaki/shared';

interface RecordButtonProps {
  state: RecordingState;
  elapsed: number;
  onStart: () => void;
  onStop: () => void;
}

function formatElapsed(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function RecordButton({ state, elapsed, onStart, onStop }: RecordButtonProps) {
  const isRecording = state === 'recording';
  const isProcessing = state === 'processing';
  const isSuccess = state === 'success';
  const isError = state === 'error';

  const handleClick = () => {
    if (isRecording) onStop();
    else if (state === 'idle' || isSuccess || isError) onStart();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Waveform bars - only shown during recording */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          height: 28,
          opacity: isRecording ? 1 : 0,
          transition: 'opacity 300ms ease',
        }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 3,
              borderRadius: 2,
              background: 'var(--recording)',
              animation: isRecording ? `wave 0.9s ease-in-out ${i * 0.08}s infinite` : 'none',
              height: isRecording ? undefined : 4,
            }}
          />
        ))}
      </div>

      {/* Main button */}
      <div style={{ position: 'relative' }}>
        {/* Pulse ring - recording */}
        {isRecording && (
          <div
            style={{
              position: 'absolute',
              inset: -8,
              borderRadius: '50%',
              border: '2px solid var(--recording)',
              animation: 'pulse-ring 1.2s ease-out infinite',
              pointerEvents: 'none',
            }}
          />
        )}

        <button
          onClick={handleClick}
          disabled={isProcessing}
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            border: 'none',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 200ms cubic-bezier(0.4,0,0.2,1)',
            background: isRecording
              ? 'var(--recording)'
              : isProcessing
                ? 'var(--bg-elevated)'
                : isSuccess
                  ? 'rgba(34,197,94,0.15)'
                  : isError
                    ? 'rgba(239,68,68,0.1)'
                    : 'var(--accent-dim)',
            boxShadow: isRecording
              ? '0 0 0 2px rgba(239,68,68,0.3), 0 8px 24px rgba(239,68,68,0.2)'
              : isProcessing
                ? 'none'
                : '0 0 0 1px var(--border), 0 4px 16px rgba(139,92,246,0.1)',
            transform: isRecording ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          {isRecording ? (
            // Stop square
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                background: 'white',
              }}
            />
          ) : isProcessing ? (
            // Spinner
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                border: '2px solid var(--border)',
                borderTop: '2px solid var(--accent)',
                animation: 'spin 0.7s linear infinite',
              }}
            />
          ) : isSuccess ? (
            // Check
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="var(--success)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : isError ? (
            // Retry icon
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M1 4v6h6M23 20v-6h-6"
                stroke="var(--error)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
                stroke="var(--error)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            // Mic icon
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" fill="var(--accent)" />
              <path
                d="M19 10v2a7 7 0 0 1-14 0v-2"
                stroke="var(--accent)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="12"
                y1="19"
                x2="12"
                y2="22"
                stroke="var(--accent)"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Label / timer */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: isRecording
            ? 'var(--recording)'
            : isProcessing
              ? 'var(--text-secondary)'
              : isSuccess
                ? 'var(--success)'
                : isError
                  ? 'var(--error)'
                  : 'var(--text-muted)',
          letterSpacing: '0.05em',
          minHeight: 18,
        }}
      >
        {isRecording
          ? formatElapsed(elapsed)
          : isProcessing
            ? 'processing…'
            : isSuccess
              ? 'done'
              : isError
                ? 'tap to retry'
                : 'tap to speak'}
      </div>

      {/* Shortcut hint */}
      <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
        Ctrl + Shift + Space
      </div>
    </div>
  );
}

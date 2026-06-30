// apps/desktop/src/renderer/src/overlay/OverlayHUD.tsx
//
// The floating "listening" HUD shown during the global-hotkey dictation flow.
// It renders inside a dedicated frameless / transparent / click-through
// BrowserWindow (loaded via the `#overlay` hash route) and is driven entirely
// by the main process over the `overlay-state` IPC channel — it never captures
// audio or steals focus from the app the user is dictating into.
import { useEffect, useRef, useState } from 'react';
import type { OverlayState } from '@inumaki/shared';

const ACCENTS: Record<OverlayState, string> = {
  listening: 'var(--recording)',
  processing: 'var(--accent)',
  success: 'var(--success)',
  error: 'var(--error)',
  hiding: 'var(--text-muted)',
  idle: 'var(--text-muted)',
};

const LABELS: Record<OverlayState, string> = {
  listening: 'Listening',
  processing: 'Polishing',
  success: 'Done',
  error: "Couldn't process",
  hiding: '',
  idle: '',
};

function formatElapsed(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function OverlayHUD() {
  const [state, setState] = useState<OverlayState>('idle');
  const [message, setMessage] = useState<string | undefined>();
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Receive state transitions from the main process.
  useEffect(() => {
    const cleanup = window.electronAPI?.onOverlayState?.((data) => {
      setState(data.state);
      setMessage(data.message);
    });
    return cleanup;
  }, []);

  // Run the elapsed-time counter only while listening.
  useEffect(() => {
    if (state === 'listening') {
      setElapsed(0);
      const started = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - started) / 1000));
      }, 250);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state]);

  // Nothing to paint between sessions; the window is also hidden by main.
  if (state === 'idle') return null;

  const accent = ACCENTS[state];
  const isListening = state === 'listening';
  const isExiting = state === 'hiding';

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}
    >
      <div
        className={isExiting ? 'hud-exit' : 'hud-enter'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '11px 16px',
          borderRadius: 999,
          background: 'rgba(14,14,17,0.82)',
          backdropFilter: 'blur(18px) saturate(140%)',
          WebkitBackdropFilter: 'blur(18px) saturate(140%)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: `0 8px 28px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02), 0 0 24px -6px ${accent}`,
        }}
      >
        <StatusIcon state={state} accent={accent} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 88 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '0.01em',
              lineHeight: 1.1,
            }}
          >
            {LABELS[state]}
            {isListening && <BlinkDots />}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: accent,
              letterSpacing: '0.04em',
              lineHeight: 1.1,
            }}
          >
            {isListening
              ? formatElapsed(elapsed)
              : state === 'processing'
                ? 'almost there'
                : state === 'success'
                  ? 'ready in your app'
                  : state === 'error'
                    ? truncate(message) || 'try again'
                    : ''}
          </span>
        </div>

        {/* Right-side visual: live equalizer while listening, otherwise a thin spacer */}
        {isListening ? (
          <Equalizer accent={accent} />
        ) : (
          <div style={{ width: 4 }} />
        )}
      </div>
    </div>
  );
}

function truncate(s?: string) {
  if (!s) return '';
  return s.length > 22 ? `${s.slice(0, 21)}…` : s;
}

function BlinkDots() {
  return (
    <span style={{ marginLeft: 1, color: 'var(--text-secondary)' }}>
      {'…'}
    </span>
  );
}

function StatusIcon({ state, accent }: { state: OverlayState; accent: string }) {
  const box = 30;
  if (state === 'processing') {
    return (
      <div style={iconBox(box)}>
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            border: '2px solid var(--border)',
            borderTopColor: accent,
            animation: 'spin 0.7s linear infinite',
          }}
        />
      </div>
    );
  }
  if (state === 'success') {
    return (
      <div style={{ ...iconBox(box), background: 'rgba(34,197,94,0.14)' }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke={accent}
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
  if (state === 'error') {
    return (
      <div style={{ ...iconBox(box), background: 'rgba(239,68,68,0.12)' }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <path d="M12 8v5" stroke={accent} strokeWidth={2.4} strokeLinecap="round" />
          <circle cx="12" cy="17" r="1.3" fill={accent} />
          <path
            d="M10.3 3.9 2.7 17.4A2 2 0 0 0 4.4 20.4h15.2a2 2 0 0 0 1.7-3l-7.6-13.5a2 2 0 0 0-3.4 0z"
            stroke={accent}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
  // listening (and the brief hiding frame): pulsing mic with a glow ring
  return (
    <div style={iconBox(box)}>
      <div
        className="hud-pulse-ring"
        style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${accent}` }}
      />
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" fill={accent} />
        <path
          d="M19 10v2a7 7 0 0 1-14 0v-2"
          stroke={accent}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="12" y1="19" x2="12" y2="22" stroke={accent} strokeWidth={2} strokeLinecap="round" />
      </svg>
    </div>
  );
}

function iconBox(size: number): React.CSSProperties {
  return {
    position: 'relative',
    width: size,
    height: size,
    flexShrink: 0,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

function Equalizer({ accent }: { accent: string }) {
  // Synthetic, always-animated bars. Lives in the visible overlay window so its
  // animation is never throttled (unlike polling levels from a hidden window).
  const bars = [0.5, 0.85, 0.35, 1, 0.6];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        height: 22,
        marginLeft: 2,
      }}
    >
      {bars.map((peak, i) => (
        <div
          key={i}
          className="hud-eq-bar"
          style={{
            width: 3,
            height: 18,
            borderRadius: 2,
            background: accent,
            transformOrigin: 'center',
            animation: `hud-eq ${(0.7 + peak * 0.5).toFixed(2)}s ease-in-out ${(i * 0.11).toFixed(2)}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

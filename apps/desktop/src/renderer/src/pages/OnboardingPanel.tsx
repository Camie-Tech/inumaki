import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../hooks/useStore';
import type { OutputMode } from '@inumaki/shared';
import { DEFAULT_HOTKEY, HOTKEY_OPTIONS, isWindowsAltHotkey } from '../../../shared/hotkeys';

declare const __API_SERVER__: string;
const API_DEFAULT = typeof __API_SERVER__ !== 'undefined' ? __API_SERVER__ : 'http://localhost:3000';

const TOTAL_STEPS = 4;

// Live mic-meter tuning.
const BAR_COUNT = 13;
const MIN_BAR = 4;
const MAX_BAR = 30;
const SPEECH_PEAK = 0.28; // normalized 0..1 peak that counts as "speech"
const SPEECH_SUSTAIN_MS = 120;

const MODES: { value: OutputMode; name: string; preview: string }[] = [
  { value: 'clean', name: 'Tidied up', preview: 'Can we maybe push the launch to Friday?' },
  { value: 'polished', name: 'Professional', preview: 'Could we move the launch to Friday?' },
  { value: 'raw', name: 'Verbatim', preview: 'um so like can we maybe push the launch to friday' },
  {
    value: 'coding_prompt',
    name: 'For AI tools',
    preview: 'Reschedule the launch from its current date to Friday.',
  },
];

interface Draft {
  microphoneId: string;
  hotkey: string;
  defaultMode: OutputMode;
  apiBase: string;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function tokenLabel(token: string): string {
  const t = token.trim();
  if (t === 'Control' || t === 'Ctrl') return 'Ctrl';
  if (['Windows', 'Win', 'Meta', 'Super', 'Cmd', 'Command'].includes(t)) return 'Win';
  return t;
}

function prettyCombo(combo: string): string {
  return combo
    .split('+')
    .map((t) => tokenLabel(t))
    .join(' + ');
}

// ─── Web Audio mic meter ──────────────────────────────────────────
type MicPermission = 'idle' | 'pending' | 'granted' | 'denied' | 'nodevice';

interface MicMeter {
  permission: MicPermission;
  bars: number[];
  level: number;
  verified: boolean;
  devices: MediaDeviceInfo[];
  fellBack: boolean; // true once a dead saved device forced a fallback to the system default
  request: () => Promise<void>;
}

function useMicMeter(deviceId: string): MicMeter {
  const [permission, setPermission] = useState<MicPermission>('idle');
  const [bars, setBars] = useState<number[]>(() => new Array(BAR_COUNT).fill(MIN_BAR));
  const [level, setLevel] = useState(0);
  const [verified, setVerified] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [fellBack, setFellBack] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);
  const smoothRef = useRef<number[]>(new Array(BAR_COUNT).fill(MIN_BAR));
  const aboveSinceRef = useRef<number | null>(null);
  const lastEmitRef = useRef(0);
  const mountedRef = useRef(true);

  const teardown = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const ctx = ctxRef.current;
    if (ctx && ctx.state !== 'closed') void ctx.close().catch(() => {});
    ctxRef.current = null;
    analyserRef.current = null;
    aboveSinceRef.current = null;
    smoothRef.current = new Array(BAR_COUNT).fill(MIN_BAR);
  }, []);

  const tick = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const binCount = analyser.frequencyBinCount; // fftSize 64 -> 32
    const data = new Uint8Array(binCount);
    analyser.getByteFrequencyData(data);

    const usable = Math.min(binCount, 24); // voice energy sits in the lower bins
    const next = smoothRef.current.slice();
    let peak = 0;
    for (let i = 0; i < BAR_COUNT; i++) {
      const bin = Math.round((i / (BAR_COUNT - 1)) * (usable - 1));
      const v = data[bin] / 255; // 0..1
      if (v > peak) peak = v;
      const target = MIN_BAR + v * (MAX_BAR - MIN_BAR);
      next[i] = next[i] + (target - next[i]) * 0.35; // lerp smoothing
    }
    smoothRef.current = next;

    const now = performance.now();
    if (peak > SPEECH_PEAK) {
      if (aboveSinceRef.current == null) aboveSinceRef.current = now;
      else if (now - aboveSinceRef.current > SPEECH_SUSTAIN_MS && mountedRef.current) setVerified(true);
    } else {
      aboveSinceRef.current = null;
    }

    if (now - lastEmitRef.current > 33 && mountedRef.current) {
      lastEmitRef.current = now;
      setBars(next.slice());
      setLevel(peak);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const request = useCallback(async () => {
    teardown();
    setVerified(false);
    setFellBack(false);
    setPermission('pending');
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: deviceId && deviceId !== 'default' ? { deviceId: { exact: deviceId } } : true,
        });
      } catch (e) {
        // A saved device that's been unplugged → fall back to the system default
        // and flag it so the caller can reconcile the persisted microphoneId.
        if ((e as DOMException)?.name === 'OverconstrainedError') {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setFellBack(true);
        } else {
          throw e;
        }
      }
      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);
      analyserRef.current = analyser;
      setPermission('granted');
      rafRef.current = requestAnimationFrame(tick);

      try {
        const all = await navigator.mediaDevices.enumerateDevices();
        if (mountedRef.current) setDevices(all.filter((d) => d.kind === 'audioinput'));
      } catch {
        /* device list is a nicety; ignore failures */
      }
    } catch (err) {
      if (!mountedRef.current) return;
      const name = (err as DOMException)?.name;
      setPermission(name === 'NotFoundError' || name === 'DevicesNotFoundError' ? 'nodevice' : 'denied');
    }
  }, [deviceId, teardown, tick]);

  // Stop tracks + close the audio graph on unmount so the OS mic indicator clears.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      teardown();
    };
  }, [teardown]);

  // Re-acquire against a new device if the meter is already live.
  useEffect(() => {
    if (permission === 'granted' || permission === 'pending') void request();
  }, [deviceId]);

  return { permission, bars, level, verified, devices, fellBack, request };
}

// ─── Hotkey trial via the real registration path ──────────────────
// The global hotkey is already registered by the main process, so pressing it
// fires the same IPC the recorder uses. We listen for that to prove the gesture
// works for BOTH hold-to-talk (Windows+Alt) and press-to-toggle accelerators —
// far more reliable than reading the Windows key from a renderer keydown.
type TrialPhase = 'idle' | 'active' | 'done';

function useHotkeyTrial(resetKey: string): TrialPhase {
  const [phase, setPhase] = useState<TrialPhase>('idle');

  useEffect(() => {
    setPhase('idle');
  }, [resetKey]);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;
    const offStart = api.onStartRecording?.(() => setPhase((p) => (p === 'done' ? 'done' : 'active')));
    const offStop = api.onProcessAudio?.(() => setPhase('done'));
    return () => {
      offStart?.();
      offStop?.();
    };
  }, []);

  return phase;
}

// ─── Shared bits ──────────────────────────────────────────────────
function useAutoFocus<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (active) ref.current?.focus();
  }, [active]);
  return ref;
}

function MicIcon({ size = 24, color = 'var(--accent)' }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
      <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" fill={color} />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <line x1="12" y1="19" x2="12" y2="22" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

function MicOffIcon({ color }: { color: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2a3 3 0 0 1 3 3v6m-6 0V5a3 3 0 0 1 3-3z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 10v2a7 7 0 0 1-11 5.7M5 10v2a7 7 0 0 0 .4 2.3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <line x1="3" y1="3" x2="21" y2="21" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <span
      style={{
        width: 14,
        height: 14,
        borderRadius: '50%',
        border: '2px solid var(--border)',
        borderTopColor: 'var(--accent)',
        display: 'inline-block',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  );
}

function CheckBadge() {
  return (
    <div
      className="animate-pop-in"
      style={{
        position: 'absolute',
        top: -2,
        right: -2,
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: 'var(--success)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 13l4 4L19 7"
          style={{ stroke: 'var(--bg)' }}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function PrimaryButton({
  label,
  onClick,
  disabled,
  busy,
  success,
  autoFocus,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  busy?: boolean;
  success?: boolean;
  autoFocus?: boolean;
}) {
  const ref = useAutoFocus<HTMLButtonElement>(Boolean(autoFocus) && !disabled);
  const hasArrow = label.endsWith('→');
  const text = hasArrow ? label.slice(0, -1).trimEnd() : label;
  return (
    <button
      ref={ref}
      type="button"
      className="ob-primary"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '12px 16px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid',
        fontFamily: 'var(--font-display)',
        fontSize: 14,
        fontWeight: 600,
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        background: success ? 'rgba(34,197,94,0.12)' : disabled ? 'var(--bg-elevated)' : 'var(--accent-dim)',
        color: success ? 'var(--success)' : disabled ? 'var(--text-muted)' : 'var(--accent-bright)',
        borderColor: success ? 'rgba(34,197,94,0.4)' : disabled ? 'var(--border)' : 'var(--border-active)',
      }}
    >
      {busy && <Spinner />}
      <span>
        {text}
        {hasArrow && <span className="ob-arrow">&nbsp;→</span>}
      </span>
    </button>
  );
}

function GhostButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      className="ob-ghost"
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        cursor: 'pointer',
        padding: '4px 8px',
      }}
    >
      {label}
    </button>
  );
}

function ProgressDots({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === step ? 16 : 5,
            height: 5,
            borderRadius: 3,
            background:
              i === step ? 'var(--accent)' : i < step ? 'var(--accent-dim)' : 'var(--text-muted)',
            transition: 'all var(--transition)',
          }}
        />
      ))}
    </div>
  );
}

function StepShell({
  step,
  onBack,
  footer,
  children,
}: {
  step: number;
  onBack?: () => void;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        height: 'calc(100% - 44px)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg)',
      }}
    >
      <div style={{ height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
        {step > 0 && onBack ? (
          <button
            type="button"
            className="ob-ghost"
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              padding: '4px 6px',
            }}
          >
            <span style={{ fontSize: 15, lineHeight: 1 }}>‹</span> Back
          </button>
        ) : null}
      </div>

      <div
        className="animate-step"
        style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {children}
      </div>

      <div style={{ flexShrink: 0, padding: '0 26px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {footer}
        <ProgressDots step={step} />
      </div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: 8,
        textAlign: 'center',
      }}
    >
      {children}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  color: 'var(--text-secondary)',
  fontSize: 11,
  fontFamily: 'var(--font-mono)',
  padding: '5px 8px',
  outline: 'none',
  cursor: 'pointer',
  maxWidth: 220,
};

// ─── Step 0 — Welcome ─────────────────────────────────────────────
function StepWelcome({ onNext }: { onNext: () => void }) {
  const reduced = prefersReducedMotion();
  return (
    <StepShell step={0} footer={<PrimaryButton label="Let's set up →" onClick={onNext} autoFocus />}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 32px',
        }}
      >
        <div
          className={reduced ? '' : 'animate-orb-rise'}
          style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 22px' }}
        >
          {!reduced && (
            <div
              className="ob-ring-once"
              style={{
                position: 'absolute',
                inset: -8,
                borderRadius: 18,
                border: '1.5px solid var(--border-active)',
                pointerEvents: 'none',
              }}
            />
          )}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background:
                'radial-gradient(circle at 50% 38%, var(--accent-dim), transparent 70%), var(--bg-elevated)',
              border: '1px solid var(--border-active)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(139,92,246,0.18)',
            }}
          >
            <MicIcon size={28} />
          </div>
        </div>

        <h1
          className={reduced ? '' : 'animate-slide-up'}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: 'var(--text-primary)',
            marginBottom: 10,
          }}
        >
          Say the word.
        </h1>
        <p
          className={reduced ? '' : 'animate-slide-up'}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 13,
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
            maxWidth: 280,
            marginBottom: 18,
            animationDelay: '60ms',
          }}
        >
          Speak anywhere. Inumaki turns your voice into clean, ready-to-paste text — instantly.
        </p>
        <div
          className={reduced ? '' : 'animate-slide-up'}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            justifyContent: 'center',
            animationDelay: '120ms',
          }}
        >
          {['No account', 'Runs in your tray', 'You hold the key'].map((c) => (
            <span
              key={c}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-muted)',
                padding: '4px 9px',
                border: '1px solid var(--border)',
                borderRadius: 999,
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </StepShell>
  );
}

// ─── Step 1 — Microphone ──────────────────────────────────────────
function LiveMeter({ bars, level, reduced }: { bars: number[]; level: number; reduced: boolean }) {
  if (reduced) {
    return (
      <div style={{ width: 64, height: 8, borderRadius: 4, background: 'var(--bg)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${Math.min(100, Math.round(level * 160))}%`,
            background: 'var(--accent)',
            transition: 'width 90ms linear',
          }}
        />
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: MAX_BAR }}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: Math.max(MIN_BAR, Math.round(h)),
            borderRadius: 2,
            background: 'var(--accent)',
            transition: 'height 70ms linear',
          }}
        />
      ))}
    </div>
  );
}

function StepMic({
  draft,
  setDraft,
  micVerified,
  setMicVerified,
  onNext,
  onBack,
}: {
  draft: Draft;
  setDraft: (u: Partial<Draft>) => void;
  micVerified: boolean;
  setMicVerified: (v: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const { set } = useStore();
  const reduced = prefersReducedMotion();
  const meter = useMicMeter(draft.microphoneId);
  const [showSkip, setShowSkip] = useState(false);

  // Returning to this step after a prior success: show a "ready" state instead
  // of re-prompting (the stream was torn down when we left).
  const ready = micVerified && meter.permission === 'idle';
  const verified = meter.verified || ready;

  useEffect(() => {
    if (meter.verified) setMicVerified(true);
  }, [meter.verified, setMicVerified]);

  useEffect(() => {
    if (meter.permission === 'granted' && !meter.verified) {
      const t = setTimeout(() => setShowSkip(true), 9000);
      return () => clearTimeout(t);
    }
    setShowSkip(false);
    return undefined;
  }, [meter.permission, meter.verified]);

  // If a saved device was gone and the meter fell back to the system default,
  // reconcile the draft so the picker's value matches reality and finish() never
  // persists a dead deviceId. Resetting to 'default' re-acquires cleanly.
  useEffect(() => {
    if (meter.fellBack) {
      setDraft({ microphoneId: 'default' });
      void set('microphoneId', 'default');
    }
  }, [meter.fellBack]);

  const pickDevice = (id: string) => {
    // Clear the verification latch: the newly chosen device hasn't been proven yet.
    setMicVerified(false);
    setDraft({ microphoneId: id });
    void set('microphoneId', id);
  };

  const isLive = meter.permission === 'granted';
  const isDenied = meter.permission === 'denied';
  const isNoDevice = meter.permission === 'nodevice';
  const isPending = meter.permission === 'pending';
  const isIdle = meter.permission === 'idle' && !ready;

  const borderColor = verified
    ? 'var(--success)'
    : isDenied
      ? 'color-mix(in srgb, var(--error) 50%, transparent)'
      : isNoDevice
        ? 'color-mix(in srgb, var(--warning) 50%, transparent)'
        : 'var(--border)';

  let status = '';
  let statusColor = 'var(--text-muted)';
  if (ready) {
    status = '✓ Mic ready';
    statusColor = 'var(--success)';
  } else if (isDenied) {
    status = 'Microphone access is blocked.';
    statusColor = 'var(--error)';
  } else if (isNoDevice) {
    status = 'No microphone found — plug one in and re-check.';
    statusColor = 'var(--warning)';
  } else if (isPending) {
    status = 'Waiting for Windows…';
    statusColor = 'var(--text-secondary)';
  } else if (isLive && verified) {
    status = '✓ Loud and clear.';
    statusColor = 'var(--success)';
  } else if (isLive) {
    status = 'Say something — anything!';
    statusColor = 'var(--accent-bright)';
  }

  const heading = isDenied ? 'Microphone is blocked' : 'Can you hear me?';
  const sub = isDenied
    ? 'Open Windows Settings › Privacy › Microphone, allow Inumaki, then hit Retry.'
    : "We'll ask Windows for mic access. Nothing is recorded yet — this just checks your levels.";

  let footer: React.ReactNode;
  if (ready) {
    footer = (
      <>
        <PrimaryButton label="Sounds great →" onClick={onNext} success autoFocus />
        <div style={{ textAlign: 'center' }}>
          <GhostButton label="Re-test microphone" onClick={() => void meter.request()} />
        </div>
      </>
    );
  } else if (isDenied) {
    footer = (
      <>
        <PrimaryButton label="Retry" onClick={() => void meter.request()} autoFocus />
        <div style={{ textAlign: 'center' }}>
          <GhostButton
            label="Skip for now"
            onClick={() => {
              setMicVerified(false);
              onNext();
            }}
          />
        </div>
      </>
    );
  } else if (isNoDevice) {
    footer = (
      <>
        <PrimaryButton label="Re-check" onClick={() => void meter.request()} autoFocus />
        <div style={{ textAlign: 'center' }}>
          <GhostButton
            label="Skip for now"
            onClick={() => {
              setMicVerified(false);
              onNext();
            }}
          />
        </div>
      </>
    );
  } else if (isIdle) {
    footer = <PrimaryButton label="Enable microphone" onClick={() => void meter.request()} autoFocus />;
  } else if (isPending) {
    footer = <PrimaryButton label="Waiting for Windows…" busy disabled />;
  } else if (isLive && verified) {
    footer = <PrimaryButton label="Sounds great →" onClick={onNext} success autoFocus />;
  } else {
    footer = (
      <>
        <PrimaryButton label="Say something first" disabled />
        {showSkip && (
          <div style={{ textAlign: 'center' }}>
            <GhostButton
              label="Skip — my mic's fine"
              onClick={() => {
                setMicVerified(false);
                onNext();
              }}
            />
          </div>
        )}
      </>
    );
  }

  return (
    <StepShell step={1} onBack={onBack} footer={footer}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 28px',
        }}
      >
        <Eyebrow>Step 1 of 3 · Microphone</Eyebrow>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 6,
            textAlign: 'center',
          }}
        >
          {heading}
        </h2>
        <p
          style={{
            fontSize: 12,
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
            maxWidth: 290,
            textAlign: 'center',
            marginBottom: 22,
          }}
        >
          {sub}
        </p>

        <div
          className={isIdle && !reduced ? 'key-hint-glow' : undefined}
          style={{
            position: 'relative',
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: 'var(--bg-elevated)',
            border: `2px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 300ms ease',
          }}
        >
          {isLive && !reduced && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: 'radial-gradient(circle, var(--accent-dim), transparent 70%)',
                opacity: Math.min(0.65, meter.level * 1.3),
                pointerEvents: 'none',
                transition: 'opacity 100ms linear',
              }}
            />
          )}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isLive ? (
              <LiveMeter bars={meter.bars} level={meter.level} reduced={reduced} />
            ) : isDenied || isNoDevice ? (
              <MicOffIcon color={isDenied ? 'var(--error)' : 'var(--warning)'} />
            ) : verified ? (
              <MicIcon size={30} color="var(--success)" />
            ) : (
              <MicIcon size={30} />
            )}
          </div>
          {verified && <CheckBadge />}
        </div>

        <div
          style={{
            minHeight: 18,
            marginTop: 16,
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: statusColor,
            textAlign: 'center',
          }}
        >
          {status}
        </div>

        {(isIdle || isPending || (isLive && !verified)) && (
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-muted)',
              textAlign: 'center',
              marginTop: 4,
              maxWidth: 280,
            }}
          >
            Audio is sent only when you record. Nothing is stored.
          </p>
        )}

        {isLive && meter.devices.length > 1 && (
          <select
            value={draft.microphoneId}
            onChange={(e) => pickDevice(e.target.value)}
            style={{ ...selectStyle, marginTop: 12 }}
          >
            <option value="default">System Default</option>
            {meter.devices.map((d, i) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Microphone ${i + 1}`}
              </option>
            ))}
          </select>
        )}
      </div>
    </StepShell>
  );
}

// ─── Step 2 — Hotkey ──────────────────────────────────────────────
function Keycap({ label, active, wide }: { label: string; active: boolean; wide?: boolean }) {
  return (
    <div
      className="ob-keycap"
      style={{
        minWidth: wide ? 66 : 40,
        padding: '8px 10px',
        textAlign: 'center',
        background: active ? 'var(--accent-dim)' : 'var(--bg-elevated)',
        border: '1px solid',
        borderColor: active ? 'var(--border-active)' : 'var(--border)',
        borderBottomWidth: active ? 1 : 3,
        borderRadius: 'var(--radius-sm)',
        color: active ? 'var(--accent-bright)' : 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        fontWeight: 500,
        transform: active ? 'translateY(2px)' : 'translateY(0)',
      }}
    >
      {label}
    </div>
  );
}

function StepHotkey({
  draft,
  setDraft,
  onNext,
  onBack,
}: {
  draft: Draft;
  setDraft: (u: Partial<Draft>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const hotkey = draft.hotkey;
  const isHold = isWindowsAltHotkey(hotkey);
  const tokens = useMemo(() => hotkey.split('+').map((t) => t.trim()).filter(Boolean), [hotkey]);
  const phase = useHotkeyTrial(hotkey);
  const [escaped, setEscaped] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    setEscaped(false);
    const t = setTimeout(() => setEscaped(true), 6000);
    return () => clearTimeout(t);
  }, [hotkey]);

  const success = phase === 'done';
  const active = phase === 'active';
  const enabled = success || escaped;

  const pickCombo = (value: string) => {
    setDraft({ hotkey: value });
    // Re-register immediately so the trial detects the newly chosen combo. The
    // main handler also persists the (normalized) value to the store.
    window.electronAPI?.updateHotkey?.(value);
  };

  let status: string;
  let statusColor = 'var(--text-muted)';
  if (success) {
    status = "✨ That's it — you've got the gesture.";
    statusColor = 'var(--success)';
  } else if (active) {
    status = isHold ? 'Listening… let go when you’re done.' : 'Recording… press again to stop.';
    statusColor = 'var(--accent-bright)';
  } else {
    status = isHold ? 'Hold your shortcut to try it…' : 'Press your shortcut to try it…';
  }

  const ctaLabel = success
    ? 'Nailed it →'
    : enabled
      ? 'Continue →'
      : isHold
        ? 'Hold the keys to continue'
        : 'Press the keys to continue';

  return (
    <StepShell
      step={2}
      onBack={onBack}
      footer={
        <PrimaryButton label={ctaLabel} onClick={onNext} disabled={!enabled} success={success} autoFocus={enabled} />
      }
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 28px',
        }}
      >
        <Eyebrow>Step 2 of 3 · Your shortcut</Eyebrow>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 6,
          }}
        >
          {isHold ? 'Hold to talk.' : 'Press to talk.'}
        </h2>
        <p
          style={{
            fontSize: 12,
            lineHeight: 1.5,
            color: 'var(--text-secondary)',
            maxWidth: 290,
            textAlign: 'center',
            marginBottom: 26,
          }}
        >
          {isHold
            ? `Hold ${prettyCombo(hotkey)} anywhere in Windows, speak, then let go. Try it right now.`
            : `Press ${prettyCombo(hotkey)} anywhere to start, speak, then press again to stop. Try it right now.`}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
          {tokens.map((t, i) => (
            <Fragment key={`${t}-${i}`}>
              {i > 0 && (
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>+</span>
              )}
              <Keycap label={tokenLabel(t)} active={active || success} wide={t === 'Space'} />
            </Fragment>
          ))}
        </div>

        <div
          style={{
            minHeight: 18,
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: statusColor,
            textAlign: 'center',
          }}
        >
          {status}
        </div>

        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {showPicker && (
            <select value={hotkey} onChange={(e) => pickCombo(e.target.value)} style={selectStyle}>
              {HOTKEY_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {prettyCombo(o)}
                </option>
              ))}
            </select>
          )}
          <GhostButton
            label={showPicker ? 'Keep this shortcut' : 'Use a different shortcut'}
            onClick={() => setShowPicker((s) => !s)}
          />
        </div>
      </div>
    </StepShell>
  );
}

// ─── Step 3 — Output style + finish ───────────────────────────────
function ModeCard({
  mode,
  selected,
  onSelect,
  innerRef,
}: {
  mode: (typeof MODES)[number];
  selected: boolean;
  onSelect: () => void;
  innerRef: (el: HTMLButtonElement | null) => void;
}) {
  return (
    <button
      ref={innerRef}
      type="button"
      role="radio"
      aria-checked={selected}
      className="ob-card"
      onClick={onSelect}
      style={{
        textAlign: 'left',
        padding: '9px 10px',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        background: selected ? 'var(--accent-dim)' : 'var(--bg-elevated)',
        border: '1px solid',
        borderColor: selected ? 'var(--border-active)' : 'var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        minHeight: 58,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: selected ? 'var(--accent)' : 'var(--text-muted)',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 12,
            fontWeight: 600,
            color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
        >
          {mode.name}
        </span>
        {selected && (
          <span className="animate-pop-in" style={{ marginLeft: 'auto', color: 'var(--accent-bright)', fontSize: 12 }}>
            ✓
          </span>
        )}
      </div>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          lineHeight: 1.35,
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {mode.preview}
      </span>
    </button>
  );
}

function StepMode({
  draft,
  setDraft,
  micVerified,
  saving,
  onFinish,
  onBack,
}: {
  draft: Draft;
  setDraft: (u: Partial<Draft>) => void;
  micVerified: boolean;
  saving: boolean;
  onFinish: () => void;
  onBack: () => void;
}) {
  const { set } = useStore();
  const reduced = prefersReducedMotion();
  const [advanced, setAdvanced] = useState(false);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectMode = (m: OutputMode) => {
    setDraft({ defaultMode: m });
    void set('defaultMode', m);
  };

  const selectedPreview = MODES.find((m) => m.value === draft.defaultMode)?.preview ?? '';

  const onGridKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = MODES.findIndex((m) => m.value === draft.defaultMode);
    let next = idx;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % MODES.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (idx - 1 + MODES.length) % MODES.length;
    else return;
    e.preventDefault();
    selectMode(MODES[next].value);
    cardRefs.current[next]?.focus();
  };

  return (
    <StepShell
      step={3}
      onBack={onBack}
      footer={
        <>
          <PrimaryButton
            label={saving ? '✓ All set' : 'Start talking →'}
            success={saving}
            onClick={onFinish}
            autoFocus
          />
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-muted)',
              textAlign: 'center',
            }}
          >
            Private by design · No account.
          </p>
        </>
      }
    >
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '4px 26px 0' }}>
        <Eyebrow>Step 3 of 3 · Your style</Eyebrow>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 4,
            textAlign: 'center',
          }}
        >
          How should it come out?
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 6 }}>
          Pick a default — change it any time.
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontStyle: 'italic',
            color: 'var(--text-muted)',
            lineHeight: 1.4,
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          You said: “um so like can we maybe push the launch to friday”
        </p>

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <div
            role="radiogroup"
            aria-label="Default output style"
            onKeyDown={onGridKey}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
          >
            {MODES.map((m, i) => (
              <ModeCard
                key={m.value}
                mode={m}
                selected={draft.defaultMode === m.value}
                onSelect={() => selectMode(m.value)}
                innerRef={(el) => {
                  cardRefs.current[i] = el;
                }}
              />
            ))}
          </div>

          <div
            key={draft.defaultMode}
            className={reduced ? '' : 'animate-fade-in'}
            style={{
              marginTop: 10,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              lineHeight: 1.45,
              color: 'var(--text-secondary)',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '9px 10px',
            }}
          >
            {selectedPreview}
          </div>

          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              className="ob-ghost"
              onClick={() => setAdvanced((a) => !a)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 0',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  transform: advanced ? 'rotate(90deg)' : 'none',
                  transition: 'transform var(--transition)',
                }}
              >
                ›
              </span>
              Advanced
            </button>
            {advanced && (
              <div className={reduced ? '' : 'ob-expand'} style={{ paddingTop: 4 }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    marginBottom: 6,
                  }}
                >
                  API Server URL
                </label>
                <input
                  type="text"
                  value={draft.apiBase}
                  onChange={(e) => setDraft({ apiBase: e.target.value })}
                  placeholder={API_DEFAULT}
                  style={{
                    width: '100%',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    color: 'var(--text-secondary)',
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    padding: '7px 9px',
                    outline: 'none',
                  }}
                />
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 5 }}>
                  Most people never touch this.
                </p>
              </div>
            )}
          </div>

          {!micVerified && (
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--warning)',
                textAlign: 'center',
                marginTop: 10,
                lineHeight: 1.4,
              }}
            >
              ⚠ Mic not tested — set it up in Settings if dictation seems off.
            </div>
          )}
        </div>
      </div>
    </StepShell>
  );
}

// ─── Root ─────────────────────────────────────────────────────────
interface OnboardingPanelProps {
  onContinue: () => void;
}

export function OnboardingPanel({ onContinue }: OnboardingPanelProps) {
  const { get, set } = useStore();
  const [step, setStep] = useState(0);
  const [micVerified, setMicVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraftState] = useState<Draft>({
    microphoneId: 'default',
    hotkey: DEFAULT_HOTKEY,
    defaultMode: 'clean',
    apiBase: API_DEFAULT,
  });

  const setDraft = useCallback((u: Partial<Draft>) => setDraftState((d) => ({ ...d, ...u })), []);

  // Seed from any values already persisted (e.g. the hotkey the main process
  // normalized + stored on launch) so the flow reflects reality.
  useEffect(() => {
    Promise.all([get('hotkey'), get('defaultMode'), get('microphoneId'), get('apiBase')])
      .then(([hk, dm, mic, base]) => {
        setDraftState((d) => ({
          ...d,
          hotkey: typeof hk === 'string' && hk ? hk : d.hotkey,
          defaultMode: (dm as OutputMode) || d.defaultMode,
          microphoneId: typeof mic === 'string' && mic ? mic : d.microphoneId,
          apiBase: typeof base === 'string' && base ? base : d.apiBase,
        }));
      })
      .catch(() => {});
  }, [get]);

  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  const finish = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    const cleaned = (draft.apiBase || '').trim().replace(/\/+$/, '') || API_DEFAULT;
    try {
      await Promise.all([
        set('apiBase', cleaned),
        set('defaultMode', draft.defaultMode),
        set('microphoneId', draft.microphoneId),
        set('onboardingComplete', true),
      ]);
    } catch {
      /* persisting onboardingComplete is best-effort; still proceed */
    }
    setTimeout(() => onContinue(), 750);
  }, [saving, draft, set, onContinue]);

  switch (step) {
    case 0:
      return <StepWelcome onNext={() => setStep(1)} />;
    case 1:
      return (
        <StepMic
          draft={draft}
          setDraft={setDraft}
          micVerified={micVerified}
          setMicVerified={setMicVerified}
          onNext={() => setStep(2)}
          onBack={back}
        />
      );
    case 2:
      return <StepHotkey draft={draft} setDraft={setDraft} onNext={() => setStep(3)} onBack={back} />;
    default:
      return (
        <StepMode
          draft={draft}
          setDraft={setDraft}
          micVerified={micVerified}
          saving={saving}
          onFinish={finish}
          onBack={back}
        />
      );
  }
}

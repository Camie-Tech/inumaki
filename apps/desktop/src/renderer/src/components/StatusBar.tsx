// apps/desktop/src/renderer/src/components/StatusBar.tsx
import type { RecordingState, OutputMode } from '@inumaki/shared';
import { OUTPUT_MODE_LABELS } from '@inumaki/shared';

interface StatusBarProps {
  state: RecordingState;
  mode: OutputMode;
  autoPaste: boolean;
}

const STATE_COLORS: Record<RecordingState, string> = {
  idle: 'var(--text-muted)',
  recording: 'var(--recording)',
  processing: 'var(--warning)',
  success: 'var(--success)',
  error: 'var(--error)',
};

export function StatusBar({ state, mode, autoPaste }: StatusBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        paddingTop: 8,
        borderTop: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text-muted)',
      }}
    >
      {/* State dot */}
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: STATE_COLORS[state],
          flexShrink: 0,
          transition: 'background 200ms ease',
          boxShadow: state === 'recording' ? '0 0 6px var(--recording)' : 'none',
        }}
      />

      {/* State label */}
      <span style={{ color: STATE_COLORS[state] }}>{state}</span>

      <span style={{ color: 'var(--border)' }}>·</span>

      {/* Mode */}
      <span>{OUTPUT_MODE_LABELS[mode]}</span>

      <div style={{ flex: 1 }} />

      {/* Auto-paste indicator */}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          color: autoPaste ? 'var(--accent)' : 'var(--text-muted)',
        }}
      >
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
          <path
            d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
            stroke="currentColor"
            strokeWidth={2.5}
          />
          <rect x="8" y="2" width="8" height="4" rx="1" stroke="currentColor" strokeWidth={2} />
        </svg>
        {autoPaste ? 'auto-paste' : 'copy only'}
      </span>
    </div>
  );
}

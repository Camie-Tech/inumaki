// apps/desktop/src/renderer/src/components/ModeSelector.tsx
import type { OutputMode } from '@inumaki/shared';
import { OUTPUT_MODE_LABELS } from '@inumaki/shared';

interface ModeSelectorProps {
  value: OutputMode;
  onChange: (mode: OutputMode) => void;
}

const MODES: OutputMode[] = ['raw', 'clean', 'polished', 'coding_prompt'];

const MODE_ICONS: Record<OutputMode, string> = {
  raw: '◌',
  clean: '✦',
  polished: '◈',
  coding_prompt: '⟨⟩',
};

const MODE_DESCRIPTIONS: Record<OutputMode, string> = {
  raw: 'Verbatim transcript',
  clean: 'Filler words removed',
  polished: 'Professional message',
  coding_prompt: 'Structured for AI',
};

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        Output Mode
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 4,
        }}
      >
        {MODES.map((m) => {
          const active = m === value;
          return (
            <button
              key={m}
              onClick={() => onChange(m)}
              title={MODE_DESCRIPTIONS[m]}
              style={{
                padding: '7px 4px',
                borderRadius: 'var(--radius-sm)',
                border: active ? '1px solid var(--border-active)' : '1px solid var(--border)',
                background: active ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                color: active ? 'var(--accent-bright)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                transition: 'all var(--transition)',
              }}
            >
              <span style={{ fontSize: 13 }}>{MODE_ICONS[m]}</span>
              <span style={{ letterSpacing: '0.03em', lineHeight: 1.2, textAlign: 'center' }}>
                {m === 'coding_prompt' ? 'Code' : OUTPUT_MODE_LABELS[m].split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

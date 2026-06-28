import { useState } from 'react';
import { useStore } from '../hooks/useStore';

declare const __API_SERVER__: string;

interface OnboardingPanelProps {
  onContinue: () => void;
}

export function OnboardingPanel({ onContinue }: OnboardingPanelProps) {
  const { set } = useStore();
  const [apiBase, setApiBase] = useState(
    typeof __API_SERVER__ !== 'undefined' ? __API_SERVER__ : 'http://localhost:3000'
  );

  const handleContinue = async () => {
    await set('apiBase', apiBase.replace(/\/$/, ''));
    await set('onboardingComplete', true);
    onContinue();
  };

  return (
    <div
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        height: 'calc(100% - 44px)',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'var(--accent-dim)',
            border: '1px solid var(--border-active)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
            <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" fill="var(--accent)" />
            <path
              d="M19 10v2a7 7 0 0 1-14 0v-2"
              stroke="var(--accent)"
              strokeWidth={2}
              strokeLinecap="round"
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
        </div>
        <div
          style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}
        >
          Inumaki AI
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          first-run setup
        </div>
      </div>

      <div
        style={{
          padding: '14px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          fontSize: 12,
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
        }}
      >
        <div style={{ marginBottom: 8, color: 'var(--text-primary)', fontWeight: 600 }}>
          How to use Inumaki
        </div>
        <div>1. Press Ctrl+Shift+Space to start recording.</div>
        <div>2. Speak naturally, then release the hotkey.</div>
        <div>3. Inumaki cleans the text and pastes it into your current app.</div>
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          API Server URL
        </span>
        <input
          type="text"
          value={apiBase}
          onChange={(e) => setApiBase(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--text-secondary)',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            padding: '8px 10px',
            outline: 'none',
          }}
        />
      </label>

      <button onClick={handleContinue} style={primaryBtn}>
        Continue
      </button>

      <p
        style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          lineHeight: 1.5,
        }}
      >
        No account required. You can change the server URL later in Settings.
      </p>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-active)',
  background: 'var(--accent-dim)',
  color: 'var(--accent-bright)',
  cursor: 'pointer',
  fontSize: 13,
  fontFamily: 'var(--font-display)',
  fontWeight: 600,
  transition: 'all var(--transition)',
};

// apps/desktop/src/renderer/src/components/OutputDisplay.tsx
import { useState } from 'react';
import type { ProcessAudioResponse } from '@inumaki/shared';

interface OutputDisplayProps {
  result: ProcessAudioResponse;
  onCopy: () => void;
  onPaste: () => void;
  onRetry: () => void;
}

export function OutputDisplay({ result, onCopy, onPaste, onRetry }: OutputDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="animate-slide-up"
      style={{
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        overflow: 'hidden',
      }}
    >
      {/* Output text */}
      <div
        style={{
          padding: '10px 12px',
          fontSize: 12,
          lineHeight: 1.6,
          color: 'var(--text-primary)',
          maxHeight: 90,
          overflow: 'auto',
          fontFamily: result.mode === 'coding_prompt' ? 'var(--font-mono)' : 'var(--font-display)',
        }}
      >
        {result.output}
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: '6px 8px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-panel)',
        }}
      >
        <ActionButton onClick={handleCopy} label={copied ? '✓ Copied' : 'Copy'} />
        <ActionButton onClick={onPaste} label="Paste" accent />
        <ActionButton onClick={() => setShowTranscript(!showTranscript)} label="Source" />
        <ActionButton onClick={onRetry} label="Retry" />
      </div>

      {/* Transcript drawer */}
      {showTranscript && (
        <div
          style={{
            padding: '8px 12px',
            borderTop: '1px solid var(--border)',
            fontSize: 11,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            lineHeight: 1.5,
            maxHeight: 70,
            overflow: 'auto',
            background: 'rgba(0,0,0,0.2)',
          }}
        >
          <span style={{ color: 'var(--text-muted)', marginRight: 6 }}>transcript:</span>
          {result.transcript}
        </div>
      )}
    </div>
  );
}

function ActionButton({
  onClick,
  label,
  accent,
}: {
  onClick: () => void;
  label: string;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: accent ? 1.5 : 1,
        padding: '4px 6px',
        borderRadius: 6,
        border: accent ? '1px solid var(--border-active)' : '1px solid var(--border)',
        background: accent ? 'var(--accent-dim)' : 'transparent',
        color: accent ? 'var(--accent-bright)' : 'var(--text-secondary)',
        cursor: 'pointer',
        fontSize: 10,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.04em',
        transition: 'all var(--transition)',
      }}
    >
      {label}
    </button>
  );
}

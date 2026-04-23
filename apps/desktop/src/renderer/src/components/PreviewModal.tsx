// apps/desktop/src/renderer/src/components/PreviewModal.tsx
import { useState } from 'react';

interface PreviewModalProps {
  transcript: string;
  output: string;
  mode: string;
  onClose: () => void;
}

export function PreviewModal({ transcript, output, mode, onClose }: PreviewModalProps) {
  const [editedOutput, setEditedOutput] = useState(output);
  const [pasted, setPasted] = useState(false);

  const handlePaste = () => {
    window.electronAPI?.pasteText?.(editedOutput);
    setPasted(true);
    setTimeout(onClose, 800);
  };

  const handleCopy = () => {
    window.electronAPI?.copyText?.(editedOutput);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 12,
      }}
    >
      <div
        className="animate-slide-up"
        style={{
          width: '100%',
          background: 'var(--bg-panel)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '10px 14px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
            }}
          >
            preview · {mode}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 16,
              lineHeight: 1,
              padding: '0 4px',
            }}
          >
            ×
          </button>
        </div>

        {/* Transcript source */}
        <div
          style={{
            padding: '8px 14px',
            borderBottom: '1px solid var(--border)',
            background: 'rgba(0,0,0,0.2)',
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              marginBottom: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Transcript
          </div>
          <p
            style={{
              fontSize: 11,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {transcript}
          </p>
        </div>

        {/* Editable output */}
        <div style={{ padding: '10px 14px' }}>
          <div
            style={{
              fontSize: 9,
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent)',
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Output · Edit before pasting
          </div>
          <textarea
            value={editedOutput}
            onChange={(e) => setEditedOutput(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-active)',
              borderRadius: 8,
              padding: '8px 10px',
              color: 'var(--text-primary)',
              fontSize: 12,
              fontFamily: mode === 'coding_prompt' ? 'var(--font-mono)' : 'var(--font-display)',
              lineHeight: 1.6,
              resize: 'none',
              outline: 'none',
            }}
          />
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            padding: '0 14px 14px',
          }}
        >
          <button onClick={onClose} style={btnStyle('secondary')}>
            Cancel
          </button>
          <button onClick={handleCopy} style={btnStyle('secondary')}>
            Copy
          </button>
          <button
            onClick={handlePaste}
            disabled={pasted}
            style={{ ...btnStyle('primary'), flex: 2 }}
          >
            {pasted ? '✓ Pasted' : 'Paste →'}
          </button>
        </div>
      </div>
    </div>
  );
}

function btnStyle(type: 'primary' | 'secondary'): React.CSSProperties {
  return {
    flex: 1,
    padding: '8px 0',
    borderRadius: 8,
    border: type === 'primary' ? '1px solid var(--border-active)' : '1px solid var(--border)',
    background: type === 'primary' ? 'var(--accent-dim)' : 'var(--bg-elevated)',
    color: type === 'primary' ? 'var(--accent-bright)' : 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: 12,
    fontFamily: 'var(--font-display)',
    fontWeight: 500,
    transition: 'all var(--transition)',
  };
}

// apps/desktop/src/renderer/src/components/TitleBar.tsx
interface TitleBarProps {
  onSettings: () => void;
  showBack?: boolean;
  onBack?: () => void;
  hideSettings?: boolean;
}

export function TitleBar({ onSettings, showBack, onBack, hideSettings }: TitleBarProps) {
  return (
    <div
      style={{
        height: 44,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        // Electron drag region
        WebkitAppRegion: 'drag' as any,
      }}
    >
      {/* Left — back or logo */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        {showBack ? (
          <button
            onClick={onBack}
            style={{
              WebkitAppRegion: 'no-drag' as any,
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: 6,
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5M12 5l-7 7 7 7"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                background: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" width="11" height="11">
                <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" fill="white" />
                <path
                  d="M19 10v2a7 7 0 0 1-14 0v-2"
                  stroke="white"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              Inumaki
            </span>
          </div>
        )}
      </div>

      {/* Right — settings + window controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          WebkitAppRegion: 'no-drag' as any,
        }}
      >
        {!hideSettings && (
          <button
            onClick={onSettings}
            title="Settings"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              transition: 'color var(--transition)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={2} />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                stroke="currentColor"
                strokeWidth={2}
              />
            </svg>
          </button>
        )}

        <button onClick={() => window.electronAPI?.minimizeWindow?.()} style={windowBtnStyle}>
          <svg width="10" height="10" viewBox="0 0 10 10">
            <rect y="4.5" width="10" height="1" fill="currentColor" rx="0.5" />
          </svg>
        </button>

        <button
          onClick={() => window.electronAPI?.hideWindow?.()}
          style={{ ...windowBtnStyle, color: '#ef4444' }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path
              d="M1.5 1.5l7 7M8.5 1.5l-7 7"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

const windowBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  width: 24,
  height: 24,
  borderRadius: 6,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color var(--transition), background var(--transition)',
};

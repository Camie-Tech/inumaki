// apps/desktop/src/renderer/src/pages/AuthPanel.tsx
import { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';

declare const __API_SERVER__: string;

interface AuthPanelProps {
  onAuthed: () => void;
}

export function AuthPanel({ onAuthed }: AuthPanelProps) {
  const { get, set } = useStore();
  const [apiBase, setApiBase] = useState(
    typeof __API_SERVER__ !== 'undefined' ? __API_SERVER__ : 'http://localhost:3000'
  );
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState('');

  // Step 1: open browser for sign-in
  const handleSignIn = async () => {
    setError('');
    setIsWaiting(true);
    const base = apiBase.replace(/\/$/, '');
    await set('apiBase', base);
    const signInUrl = `${base}/auth/signin?desktop=1`;
    window.electronAPI?.openAuth?.(signInUrl);
  };

  useEffect(() => {
    if (window.electronAPI?.onDeepLinkToken) {
      const cleanup = window.electronAPI.onDeepLinkToken(
        async ({ token, code, base: deepBase }) => {
          setIsWaiting(true);
          const incomingToken = token?.trim() ?? '';
          const incomingCode = code?.trim() ?? '';

          if (!incomingToken && !incomingCode) {
            setIsWaiting(false);
            return;
          }

          const base = (deepBase?.trim() || ((await get('apiBase')) as string) || apiBase).replace(
            /\/$/,
            ''
          );
          try {
            await set('apiBase', base);
            let sessionToken = incomingToken;

            if (incomingCode) {
              const exchangeRes = await fetch(`${base}/api/auth/desktop/exchange`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: incomingCode }),
              });

              if (!exchangeRes.ok) throw new Error('Desktop auth exchange failed');
              const exchangeData = await exchangeRes.json();
              if (!exchangeData.valid || !exchangeData.token) {
                throw new Error('Desktop auth exchange rejected');
              }

              sessionToken = exchangeData.token as string;
            } else {
              const verifyRes = await fetch(`${base}/api/auth/verify-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: sessionToken }),
              });

              if (!verifyRes.ok) throw new Error('Invalid token');
              const verifyData = await verifyRes.json();
              if (!verifyData.valid) throw new Error('Token rejected');
            }

            await set('authToken', sessionToken);
            setApiBase(base);
            onAuthed();
          } catch {
            setError('Authentication failed. Please try again.');
            setIsWaiting(false);
          }
        }
      );
      return cleanup;
    }
  }, []);

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
      {/* Logo */}
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
          internal access only
        </div>
      </div>

      {!isWaiting ? (
        <>
          {error && (
            <div
              style={{
                fontSize: 11,
                color: 'var(--error)',
                fontFamily: 'var(--font-mono)',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          <button onClick={handleSignIn} style={primaryBtn}>
            Sign In →
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
            Requires an active session via the web platform.
          </p>
        </>
      ) : (
        <>
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-dim)',
              border: '1px solid var(--border-active)',
              fontSize: 12,
              color: 'var(--accent-bright)',
              lineHeight: 1.6,
              textAlign: 'center',
            }}
          >
            Browser opened for sign-in.
            <br />
            Waiting for authentication...
          </div>

          {error && (
            <div
              style={{
                fontSize: 11,
                color: 'var(--error)',
                fontFamily: 'var(--font-mono)',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={() => {
              setIsWaiting(false);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            ← Cancel
          </button>
        </>
      )}
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

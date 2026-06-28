// apps/desktop/src/renderer/src/App.tsx
import { useState, useEffect } from 'react';
import { MainPanel } from './pages/MainPanel';
import { SettingsPanel } from './pages/SettingsPanel';
import { OnboardingPanel } from './pages/OnboardingPanel';
import { PreviewModal } from './components/PreviewModal';
import { TitleBar } from './components/TitleBar';
import { useStore } from './hooks/useStore';

type Page = 'main' | 'settings';

export default function App() {
  const [page, setPage] = useState<Page>('main');
  const [preview, setPreview] = useState<{
    transcript: string;
    output: string;
    mode: string;
  } | null>(null);

  const { get } = useStore();
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    get('onboardingComplete').then((complete) => {
      setOnboardingComplete(Boolean(complete));
      setCheckingOnboarding(false);
    });
  }, []);

  // Listen for navigation events from main process
  useEffect(() => {
    const cleanup = window.electronAPI?.onNavigate?.((path) => {
      if (path === '/settings') setPage('settings');
      else setPage('main');
    });
    return cleanup;
  }, []);

  if (checkingOnboarding) {
    return (
      <div
        style={{
          height: '100vh',
          background: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          className="spinner"
          style={{
            width: 20,
            height: 20,
            border: '2px solid var(--border)',
            borderTop: '2px solid var(--accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  if (!onboardingComplete) {
    return (
      <div
        style={{ height: '100vh', background: 'var(--bg)', borderRadius: 12, overflow: 'hidden' }}
      >
        <TitleBar onSettings={() => {}} hideSettings />
        <OnboardingPanel onContinue={() => setOnboardingComplete(true)} />
      </div>
    );
  }

  return (
    <div
      style={{
        height: '100vh',
        background: 'var(--bg)',
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--border)',
      }}
    >
      <TitleBar
        onSettings={() => setPage(page === 'settings' ? 'main' : 'settings')}
        showBack={page !== 'main'}
        onBack={() => setPage('main')}
      />

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {page === 'main' && <MainPanel onShowPreview={(data) => setPreview(data)} />}
        {page === 'settings' && <SettingsPanel onBack={() => setPage('main')} />}
      </div>

      {preview && (
        <PreviewModal
          transcript={preview.transcript}
          output={preview.output}
          mode={preview.mode}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}

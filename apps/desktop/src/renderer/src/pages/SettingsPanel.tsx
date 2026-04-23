// apps/desktop/src/renderer/src/pages/SettingsPanel.tsx
import { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import type { OutputMode } from '@inumaki/shared';

const TONES = ['neutral', 'formal', 'casual', 'concise', 'friendly'];
const HOTKEYS = ['Control+Shift+Space', 'Control+Alt+Space', 'Alt+Shift+R', 'Control+Shift+R'];

interface SettingsPanelProps {
  onBack: () => void;
}

export function SettingsPanel({ onBack }: SettingsPanelProps) {
  const { get, set } = useStore();
  const [prefs, setPrefs] = useState({
    defaultMode: 'clean' as OutputMode,
    autoPaste: true,
    previewBeforePaste: false,
    hotkey: 'Control+Shift+Space',
    microphoneId: 'default',
    tonePreference: 'neutral',
    apiBase: '',
    startMinimized: false,
  });
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      get('defaultMode'),
      get('autoPaste'),
      get('previewBeforePaste'),
      get('hotkey'),
      get('microphoneId'),
      get('tonePreference'),
      get('apiBase'),
      get('startMinimized'),
    ]).then(([dm, ap, pp, hk, mic, tone, base, sm]) => {
      setPrefs({
        defaultMode: (dm as OutputMode) || 'clean',
        autoPaste: (ap as boolean) ?? true,
        previewBeforePaste: (pp as boolean) ?? false,
        hotkey: (hk as string) || 'Control+Shift+Space',
        microphoneId: (mic as string) || 'default',
        tonePreference: (tone as string) || 'neutral',
        apiBase: (base as string) || '',
        startMinimized: (sm as boolean) ?? false,
      });
    });

    // Enumerate microphones
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      setMicrophones(devices.filter((d) => d.kind === 'audioinput'));
    });
  }, []);

  const update = (key: string, value: unknown) => {
    setPrefs((p) => ({ ...p, [key]: value }));
  };

  const handleSave = async () => {
    await Promise.all(Object.entries(prefs).map(([k, v]) => set(k, v)));

    // Update hotkey in main process
    if (window.electronAPI?.updateHotkey) {
      window.electronAPI.updateHotkey(prefs.hotkey);
    }

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onBack();
    }, 800);
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Section title="Input">
            <SelectField
              label="Microphone"
              value={prefs.microphoneId}
              onChange={(v) => update('microphoneId', v)}
              options={[
                { value: 'default', label: 'System Default' },
                ...microphones.map((m) => ({
                  value: m.deviceId,
                  label: m.label || `Microphone ${m.deviceId.slice(0, 6)}`,
                })),
              ]}
            />
            <SelectField
              label="Hotkey"
              value={prefs.hotkey}
              onChange={(v) => update('hotkey', v)}
              options={HOTKEYS.map((h) => ({ value: h, label: h }))}
            />
          </Section>

          <Section title="Output">
            <SelectField
              label="Default Mode"
              value={prefs.defaultMode}
              onChange={(v) => update('defaultMode', v)}
              options={[
                { value: 'raw', label: 'Raw Transcript' },
                { value: 'clean', label: 'Clean Text' },
                { value: 'polished', label: 'Polished Message' },
                { value: 'coding_prompt', label: 'Coding Prompt' },
              ]}
            />
            <SelectField
              label="Tone"
              value={prefs.tonePreference}
              onChange={(v) => update('tonePreference', v)}
              options={TONES.map((t) => ({
                value: t,
                label: t.charAt(0).toUpperCase() + t.slice(1),
              }))}
            />
          </Section>

          <Section title="Behavior">
            <ToggleField
              label="Auto-paste"
              description="Paste directly into focused app"
              value={prefs.autoPaste}
              onChange={(v) => update('autoPaste', v)}
            />
            <ToggleField
              label="Preview before paste"
              description="Review and edit output first"
              value={prefs.previewBeforePaste}
              onChange={(v) => update('previewBeforePaste', v)}
            />
            <ToggleField
              label="Start minimized"
              description="Launch in system tray"
              value={prefs.startMinimized}
              onChange={(v) => update('startMinimized', v)}
            />
          </Section>

          <Section title="Connection">
            <TextField
              label="API Server URL"
              value={prefs.apiBase}
              onChange={(v) => update('apiBase', v)}
              placeholder="https://your-inumaki-domain.com"
            />
          </Section>
        </div>
      </div>

      {/* Save bar */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '9px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-active)',
            background: saved ? 'rgba(34,197,94,0.1)' : 'var(--accent-dim)',
            color: saved ? 'var(--success)' : 'var(--accent-bright)',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            transition: 'all var(--transition)',
          }}
        >
          {saved ? '✓ Saved' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <div
        style={{
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ToggleField({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 12px',
        gap: 12,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {description}
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          border: 'none',
          background: value ? 'var(--accent)' : 'var(--bg)',
          cursor: 'pointer',
          position: 'relative',
          flexShrink: 0,
          transition: 'background 200ms ease',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: value ? 18 : 2,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'white',
            transition: 'left 200ms ease',
          }}
        />
      </button>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 12px',
        gap: 12,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
      }}
    >
      <div style={{ flex: 1, fontSize: 12, color: 'var(--text-primary)' }}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          color: 'var(--text-secondary)',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          padding: '4px 8px',
          outline: 'none',
          cursor: 'pointer',
          maxWidth: 160,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div
      style={{
        padding: '10px 12px',
        background: 'var(--bg-elevated)',
      }}
    >
      <div style={{ fontSize: 12, color: 'var(--text-primary)', marginBottom: 6 }}>{label}</div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          color: 'var(--text-secondary)',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          padding: '6px 8px',
          outline: 'none',
        }}
      />
    </div>
  );
}

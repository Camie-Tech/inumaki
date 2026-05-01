// apps/desktop/src/main/preload.ts
import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';
import type { IpcChannel, RecordingStateChange } from '@inumaki/shared';

contextBridge.exposeInMainWorld('electronAPI', {
  // ─── Recording ──────────────────────────────────────────────────
  onRecordingStateChange: (cb: (data: RecordingStateChange) => void) => {
    ipcRenderer.on('recording-state-change', (_e, data) => cb(data));
    return () => ipcRenderer.removeAllListeners('recording-state-change');
  },

  onProcessAudio: (cb: (data: any) => void) => {
    ipcRenderer.on('process-audio', (_e, data) => cb(data));
    return () => ipcRenderer.removeAllListeners('process-audio');
  },

  sendProcessResult: (state: string, message?: string) => {
    ipcRenderer.send('process-audio-result', { state, message });
  },

  // ─── Clipboard / Paste ──────────────────────────────────────────
  pasteText: (text: string) => ipcRenderer.send('paste-text', text),
  copyText: (text: string) => ipcRenderer.send('copy-text', text),

  // ─── Hotkey ─────────────────────────────────────────────────────
  updateHotkey: (hotkey: string) => ipcRenderer.send('update-hotkey', hotkey),
  onHotkeyTriggered: (cb: () => void) => {
    ipcRenderer.on('hotkey-triggered', cb);
    return () => ipcRenderer.removeAllListeners('hotkey-triggered');
  },

  // ─── Navigation ─────────────────────────────────────────────────
  onNavigate: (cb: (path: string) => void) => {
    ipcRenderer.on('navigate', (_e, path) => cb(path));
    return () => ipcRenderer.removeAllListeners('navigate');
  },

  // ─── Window controls ────────────────────────────────────────────
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  hideWindow: () => ipcRenderer.send('window-hide'),

  // ─── Persistent store ───────────────────────────────────────────
  storeGet: (key: string) => ipcRenderer.invoke('store-get', key),
  storeSet: (key: string, value: unknown) => ipcRenderer.invoke('store-set', key, value),

  // ─── Auth ───────────────────────────────────────────────────────
  openAuth: (url: string) => ipcRenderer.send('open-auth', url),
  getPendingAuthLink: () => ipcRenderer.invoke('auth-get-pending-link'),
  exchangeDesktopAuthCode: (base: string, code: string) =>
    ipcRenderer.invoke('auth-exchange-code', base, code),
  verifyDesktopAuthToken: (base: string, token: string) =>
    ipcRenderer.invoke('auth-verify-token', base, token),
  onDeepLinkToken: (
    cb: (payload: { token?: string | null; code?: string | null; base?: string | null }) => void
  ) => {
    const listener = (
      _e: IpcRendererEvent,
      payload: { token?: string | null; code?: string | null; base?: string | null }
    ) => cb(payload);
    ipcRenderer.on('deep-link-token', listener);
    return () => ipcRenderer.removeListener('deep-link-token', listener);
  },
});

// Type declaration for window.electronAPI
declare global {
  interface Window {
    electronAPI: {
      onRecordingStateChange: (cb: (data: RecordingStateChange) => void) => () => void;
      onProcessAudio: (cb: (data: any) => void) => () => void;
      sendProcessResult: (state: string, message?: string) => void;
      pasteText: (text: string) => void;
      copyText: (text: string) => void;
      updateHotkey: (hotkey: string) => void;
      onHotkeyTriggered: (cb: () => void) => () => void;
      onNavigate: (cb: (path: string) => void) => () => void;
      minimizeWindow: () => void;
      hideWindow: () => void;
      storeGet: (key: string) => Promise<unknown>;
      storeSet: (key: string, value: unknown) => Promise<void>;
      openAuth: (url: string) => void;
      getPendingAuthLink: () => Promise<{
        token?: string | null;
        code?: string | null;
        base?: string | null;
      } | null>;
      exchangeDesktopAuthCode: (base: string, code: string) => Promise<any>;
      verifyDesktopAuthToken: (base: string, token: string) => Promise<any>;
      onDeepLinkToken: (
        cb: (payload: { token?: string | null; code?: string | null; base?: string | null }) => void
      ) => () => void;
    };
  }
}

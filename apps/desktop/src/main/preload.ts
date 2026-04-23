// apps/desktop/src/main/preload.ts
import { contextBridge, ipcRenderer } from 'electron';
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
  onDeepLinkToken: (
    cb: (payload: { token?: string | null; code?: string | null; base?: string | null }) => void
  ) => {
    ipcRenderer.on('deep-link-token', (_e, payload) => cb(payload));
    return () => ipcRenderer.removeAllListeners('deep-link-token');
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
      onDeepLinkToken: (
        cb: (payload: { token?: string | null; code?: string | null; base?: string | null }) => void
      ) => () => void;
    };
  }
}

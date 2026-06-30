// apps/desktop/src/main/preload.ts
import { contextBridge, ipcRenderer } from 'electron';
import type {
  OverlayStateChange,
  ProcessAudioRequest,
  ProcessAudioResponse,
  RecordingStateChange,
} from '@inumaki/shared';

contextBridge.exposeInMainWorld('electronAPI', {
  // ─── Recording ──────────────────────────────────────────────────
  onRecordingStateChange: (cb: (data: RecordingStateChange) => void) => {
    ipcRenderer.on('recording-state-change', (_e, data) => cb(data));
    return () => ipcRenderer.removeAllListeners('recording-state-change');
  },

  onStartRecording: (cb: () => void) => {
    ipcRenderer.on('start-recording', () => cb());
    return () => ipcRenderer.removeAllListeners('start-recording');
  },

  onProcessAudio: (cb: (data: unknown) => void) => {
    ipcRenderer.on('process-audio', (_e, data) => cb(data));
    return () => ipcRenderer.removeAllListeners('process-audio');
  },

  sendProcessResult: (state: string, message?: string) => {
    ipcRenderer.send('process-audio-result', { state, message });
  },

  processAudio: (request: ProcessAudioRequest): Promise<ProcessAudioResponse> => {
    return ipcRenderer.invoke('process-audio-local', request);
  },

  // ─── Listening HUD overlay ──────────────────────────────────────
  // Driven by the main process for the global-hotkey dictation flow.
  onOverlayState: (cb: (data: OverlayStateChange) => void) => {
    ipcRenderer.on('overlay-state', (_e, data) => cb(data));
    return () => ipcRenderer.removeAllListeners('overlay-state');
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

  // ─── App ────────────────────────────────────────────────────────
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('get-app-version'),

});

// Type declaration for window.electronAPI
declare global {
  interface Window {
    electronAPI: {
      onRecordingStateChange: (cb: (data: RecordingStateChange) => void) => () => void;
      onStartRecording: (cb: () => void) => () => void;
      onProcessAudio: (cb: (data: unknown) => void) => () => void;
      sendProcessResult: (state: string, message?: string) => void;
      processAudio: (request: ProcessAudioRequest) => Promise<ProcessAudioResponse>;
      onOverlayState: (cb: (data: OverlayStateChange) => void) => () => void;
      pasteText: (text: string) => void;
      copyText: (text: string) => void;
      updateHotkey: (hotkey: string) => void;
      onHotkeyTriggered: (cb: () => void) => () => void;
      onNavigate: (cb: (path: string) => void) => () => void;
      minimizeWindow: () => void;
      hideWindow: () => void;
      storeGet: (key: string) => Promise<unknown>;
      storeSet: (key: string, value: unknown) => Promise<void>;
      getAppVersion: () => Promise<string>;
    };
  }
}

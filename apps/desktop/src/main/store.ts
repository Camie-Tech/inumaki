// apps/desktop/src/main/store.ts
import ElectronStore from 'electron-store';

interface StoreSchema {
  hotkey: string;
  defaultMode: string;
  autoPaste: boolean;
  previewBeforePaste: boolean;
  microphoneId: string;
  tonePreference: string;
  startMinimized: boolean;
  authToken: string;
  apiBase: string;
}

// electron-store v11 exposes its types through an ESM "exports" map that
// classic (node10) module resolution — which we're pinned to because the
// Electron main process is CommonJS and relies on __dirname — cannot read, so
// tsc doesn't see the instance get/set methods. Declare the slice we use and
// cast; the methods exist at runtime.
interface TypedStore {
  get(key: string, defaultValue?: unknown): unknown;
  set(key: string, value: unknown): void;
  delete(key: string): void;
}

export const store = new ElectronStore<StoreSchema>({
  defaults: {
    hotkey: 'Control+Shift+Space',
    defaultMode: 'clean',
    autoPaste: true,
    previewBeforePaste: false,
    microphoneId: 'default',
    tonePreference: 'neutral',
    startMinimized: false,
    authToken: '',
    apiBase: 'https://inumaki-five.vercel.app',
  },
  encryptionKey: process.env.STORE_ENCRYPTION_KEY,
}) as unknown as TypedStore;

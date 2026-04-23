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
    apiBase: 'https://your-inumaki-domain.com',
  },
  encryptionKey: process.env.STORE_ENCRYPTION_KEY,
});

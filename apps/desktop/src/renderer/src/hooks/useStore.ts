// apps/desktop/src/renderer/src/hooks/useStore.ts
import { useCallback } from 'react';

export function useStore() {
  const get = useCallback(async (key: string): Promise<any> => {
    if (window.electronAPI) {
      return window.electronAPI.storeGet(key);
    }
    return localStorage.getItem(key);
  }, []);

  const set = useCallback(async (key: string, value: unknown): Promise<void> => {
    if (window.electronAPI) {
      await window.electronAPI.storeSet(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, []);

  return { get, set };
}

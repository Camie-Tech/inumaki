import { globalShortcut } from 'electron';
import { createRequire } from 'module';
import path from 'path';
import {
  GlobalKeyboardListener,
  type IGlobalKey,
  type IGlobalKeyDownMap,
  type IGlobalKeyListener,
} from 'node-global-key-listener';
import {
  DEFAULT_HOTKEY,
  LEGACY_DEFAULT_HOTKEY,
  isWindowsAltHotkey,
  normalizeHotkey,
} from '../shared/hotkeys';

type HotkeyActions = {
  toggle: () => void;
  start: () => void;
  stop: () => void;
};

const runtimeRequire = createRequire(__filename);

let keyboardListener: GlobalKeyboardListener | null = null;
let windowsAltActive = false;

export function registerHotkey(hotkeyInput: unknown, actions: HotkeyActions): string {
  unregisterHotkeys();

  const hotkey = normalizeHotkey(hotkeyInput);
  if (isWindowsAltHotkey(hotkey)) {
    registerWindowsAltHotkey(actions);
    return DEFAULT_HOTKEY;
  }

  registerElectronHotkey(hotkey, actions, LEGACY_DEFAULT_HOTKEY);
  return hotkey;
}

export function unregisterHotkeys(): void {
  globalShortcut.unregisterAll();

  if (keyboardListener) {
    keyboardListener.kill();
    keyboardListener = null;
  }

  windowsAltActive = false;
}

function registerElectronHotkey(hotkey: string, actions: HotkeyActions, fallback?: string): void {
  const registered = globalShortcut.register(hotkey, actions.toggle);
  if (registered) return;

  console.error(`Failed to register hotkey: ${hotkey}`);

  if (!fallback || fallback === hotkey) return;

  const fallbackRegistered = globalShortcut.register(fallback, actions.toggle);
  if (!fallbackRegistered) {
    console.error(`Failed to register fallback hotkey: ${fallback}`);
  }
}

function registerWindowsAltHotkey(actions: HotkeyActions): void {
  if (process.platform !== 'win32') {
    console.error(`${DEFAULT_HOTKEY} is only available on Windows; using ${LEGACY_DEFAULT_HOTKEY}.`);
    registerElectronHotkey(LEGACY_DEFAULT_HOTKEY, actions);
    return;
  }

  const listener = new GlobalKeyboardListener({
    windows: {
      serverPath: resolveWinKeyServerPath(),
      onError: (code) => console.error(`Windows hotkey listener exited with code: ${code}`),
    },
  });

  keyboardListener = listener;

  const handler: IGlobalKeyListener = (event, down) => {
    if (isWindowsAltTriggerDown(down)) {
      if (!windowsAltActive) {
        windowsAltActive = true;
        actions.start();
      }

      return true;
    }

    if (windowsAltActive && event.state === 'UP' && isWindowsAltKey(event.name)) {
      windowsAltActive = false;
      actions.stop();
      return true;
    }

    return undefined;
  };

  void listener.addListener(handler).catch((error) => {
    if (keyboardListener === listener) {
      keyboardListener = null;
      windowsAltActive = false;
    }

    console.error('Failed to start Windows+Alt hotkey listener:', error);
    registerElectronHotkey(LEGACY_DEFAULT_HOTKEY, actions);
  });
}

function isWindowsAltTriggerDown(down: IGlobalKeyDownMap): boolean {
  return (
    (down['LEFT META'] === true || down['RIGHT META'] === true) &&
    (down['LEFT ALT'] === true || down['RIGHT ALT'] === true)
  );
}

function isWindowsAltKey(key: IGlobalKey | undefined): boolean {
  return key === 'LEFT META' || key === 'RIGHT META' || key === 'LEFT ALT' || key === 'RIGHT ALT';
}

function resolveWinKeyServerPath(): string | undefined {
  try {
    const resolvedPath = runtimeRequire.resolve('node-global-key-listener/bin/WinKeyServer.exe');
    return resolvedPath.replace(
      `${path.sep}app.asar${path.sep}`,
      `${path.sep}app.asar.unpacked${path.sep}`
    );
  } catch (error) {
    console.warn('Could not resolve WinKeyServer.exe; using package default path.', error);
    return undefined;
  }
}

// apps/desktop/src/main/main.ts
import {
  app,
  BrowserWindow,
  ipcMain,
  clipboard,
  Tray,
  Menu,
  nativeImage,
  Notification,
  screen,
} from 'electron';
import path from 'path';
import { AudioRecorder } from './audio-recorder';
import { store } from './store';
import { setupAutoUpdater } from './updater';
import { captureForegroundWindow, pasteText } from './windows-input';
import { registerHotkey, unregisterHotkeys } from './hotkey-registration';
import { DEFAULT_HOTKEY, shouldMigrateHotkey } from '../shared/hotkeys';
import { processAudioLocally } from './local-transcription';

// ─── Constants ────────────────────────────────────────────────────
const isDev = process.env.NODE_ENV === 'development';
const DEV_RENDERER_URL = 'http://localhost:5173';

// ─── State ────────────────────────────────────────────────────────
let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let recorder: AudioRecorder | null = null;

// The listening HUD only follows the global-hotkey dictation flow. The in-app
// record button drives the renderer directly and shows its own UI, so this flag
// keeps the result handler from popping the overlay for in-window recordings.
let overlayFlowActive = false;
let overlayHideTimer: ReturnType<typeof setTimeout> | null = null;

// HUD pill dimensions (window is transparent; the pill is centered within it).
const OVERLAY_WIDTH = 300;
const OVERLAY_HEIGHT = 84;

// ─── Window ───────────────────────────────────────────────────────
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 360,
    height: 520,
    minWidth: 320,
    minHeight: 420,
    frame: false,
    transparent: true,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL(DEV_RENDERER_URL);
  } else {
    // Packaged: the renderer is bundled at dist/renderer; main runs from
    // dist/main, so the built index.html is one level up under renderer/.
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  }

  mainWindow.on('ready-to-show', () => {
    if (store.get('startMinimized', false)) return;
    mainWindow?.show();
  });

  mainWindow.on('close', (e) => {
    e.preventDefault();
    mainWindow?.hide();
  });

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

}

// ─── Listening HUD overlay ────────────────────────────────────────
// A frameless, transparent, click-through, non-focusable window that floats the
// "Inumaki is listening" pill. Created hidden at startup so the global hotkey can
// reveal it instantly (showInactive) without ever stealing focus from the app
// the user is dictating into.
function createOverlayWindow() {
  overlayWindow = new BrowserWindow({
    width: OVERLAY_WIDTH,
    height: OVERLAY_HEIGHT,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    focusable: false,
    hasShadow: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Float above virtually everything, including most fullscreen apps.
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  // Purely informational: never intercept clicks meant for the app underneath.
  overlayWindow.setIgnoreMouseEvents(true);

  if (isDev) {
    overlayWindow.loadURL(`${DEV_RENDERER_URL}#overlay`);
  } else {
    overlayWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'), {
      hash: 'overlay',
    });
  }

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });
}

// Center the pill horizontally near the bottom of whichever display the cursor
// is on, so it appears where the user is currently working on multi-monitor setups.
function positionOverlay() {
  if (!overlayWindow) return;
  const cursor = screen.getCursorScreenPoint();
  const { workArea } = screen.getDisplayNearestPoint(cursor);
  const [w, h] = overlayWindow.getSize();
  const x = Math.round(workArea.x + (workArea.width - w) / 2);
  const y = Math.round(workArea.y + workArea.height - h - 96);
  overlayWindow.setPosition(x, y);
}

function sendOverlayState(state: string, message?: string) {
  overlayWindow?.webContents.send('overlay-state', { state, message });
}

function showOverlay(state: string) {
  if (!overlayWindow) return;
  if (store.get('showOverlay', true) === false) return;

  if (overlayHideTimer) {
    clearTimeout(overlayHideTimer);
    overlayHideTimer = null;
  }

  positionOverlay();
  sendOverlayState(state);
  // showInactive() reveals the window without activating it, preserving the
  // user's focused app so the eventual paste lands in the right place.
  if (!overlayWindow.isVisible()) overlayWindow.showInactive();
}

// Fade the pill out (CSS), then hide the window after the animation settles.
function hideOverlay(delayMs: number) {
  if (overlayHideTimer) clearTimeout(overlayHideTimer);
  overlayHideTimer = setTimeout(() => {
    sendOverlayState('hiding');
    overlayHideTimer = setTimeout(() => {
      overlayWindow?.hide();
      sendOverlayState('idle');
      overlayHideTimer = null;
    }, 260);
  }, delayMs);
}

// ─── Tray ─────────────────────────────────────────────────────────
function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, '../../assets/tray-icon.png'));
  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  tray.setToolTip('Inumaki AI');
  updateTrayMenu();

  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
      mainWindow?.focus();
    }
  });
}

function updateTrayMenu(state?: string) {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Inumaki AI',
      enabled: false,
      icon: undefined,
    },
    { type: 'separator' },
    {
      label: state ? `Status: ${state}` : 'Idle',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Show Window',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    {
      label: 'Settings',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
        mainWindow?.webContents.send('navigate', '/settings');
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);
  tray?.setContextMenu(contextMenu);
}

// ─── Recording ────────────────────────────────────────────────────
function startRecording() {
  if (!recorder || recorder.isRecording()) return;

  // Remember the user's focused app NOW (before anything can change focus) so we
  // can paste back into it later. Fire-and-forget; resolves well before paste.
  void captureForegroundWindow();

  recorder.start();
  // Tell the renderer to actually begin capturing audio (it owns MediaRecorder).
  mainWindow?.webContents.send('start-recording');
  mainWindow?.webContents.send('recording-state-change', { state: 'recording' });
  updateTrayMenu('Recording…');

  // Reveal the listening HUD for this (hotkey-initiated) dictation session.
  overlayFlowActive = true;
  showOverlay('listening');
}

function stopRecording() {
  if (!recorder || !recorder.isRecording()) return;

  recorder.stop();
  mainWindow?.webContents.send('recording-state-change', { state: 'processing' });
  updateTrayMenu('Processing…');

  if (overlayFlowActive) sendOverlayState('processing');

  // The renderer holds the captured audio — tell it to stop, encode, and process.
  // It posts to the API and, on success, calls pasteText/copyText back to main.
  mainWindow?.webContents.send('process-audio');
}

const hotkeyActions = {
  toggle: () => {
    if (!recorder) return;

    if (recorder.isRecording()) {
      stopRecording();
    } else {
      startRecording();
    }
  },
  start: startRecording,
  stop: stopRecording,
};

// ─── IPC Handlers ────────────────────────────────────────────────
function setupIpc() {
  // Paste text into the window that was focused when recording started:
  // write the clipboard and simulate Ctrl+V (Windows), restoring the prior
  // clipboard afterwards. Best-effort keystroke over a guaranteed clipboard write.
  ipcMain.on('paste-text', (_event, text: string) => {
    void pasteText(text);
  });

  // Copy only
  ipcMain.on('copy-text', (_event, text: string) => {
    clipboard.writeText(text);
    new Notification({
      title: 'Inumaki AI',
      body: 'Text copied to clipboard',
      silent: true,
    }).show();
  });

  // Hotkey update
  ipcMain.on('update-hotkey', (_event, hotkey: string) => {
    const registeredHotkey = registerHotkey(hotkey, hotkeyActions);
    store.set('hotkey', registeredHotkey);
  });

  // State feedback from renderer
  ipcMain.on('process-audio-result', (_event, { state, message }) => {
    mainWindow?.webContents.send('recording-state-change', { state, message });
    updateTrayMenu(state === 'success' ? 'Done' : state);
    setTimeout(() => updateTrayMenu(), 3000);

    // Reflect the outcome in the HUD, then fade it out (only when the session
    // was started by the global hotkey).
    if (overlayFlowActive) {
      overlayFlowActive = false;
      if (state === 'success') {
        sendOverlayState('success');
        hideOverlay(1100);
      } else {
        sendOverlayState('error', message);
        hideOverlay(2600);
      }
    }
  });

  ipcMain.handle('process-audio-local', async (_event, request) => {
    return processAudioLocally(request);
  });

  // Window controls
  ipcMain.on('window-minimize', () => mainWindow?.minimize());
  ipcMain.on('window-hide', () => mainWindow?.hide());
  ipcMain.on('window-close', () => mainWindow?.hide());

  // App version (shown in the UI; confirms which build is running after an update)
  ipcMain.handle('get-app-version', () => app.getVersion());

  // Store access
  ipcMain.handle('store-get', (_event, key: string) => store.get(key));
  ipcMain.handle('store-set', (_event, key: string, value: unknown) => {
    store.set(key, value);
  });

}

// ─── App Lifecycle ────────────────────────────────────────────────
app.whenReady().then(async () => {
  createMainWindow();
  createOverlayWindow();
  createTray();
  setupIpc();

  recorder = new AudioRecorder();

  // Register hotkey
  const storedHotkey = store.get('hotkey', DEFAULT_HOTKEY);
  const savedHotkey = shouldMigrateHotkey(storedHotkey) ? DEFAULT_HOTKEY : storedHotkey;
  const registeredHotkey = registerHotkey(savedHotkey, hotkeyActions);
  store.set('hotkey', registeredHotkey);

  if (!isDev) {
    setupAutoUpdater();
  }
});

app.on('window-all-closed', () => {
  // Keep running in tray
});

app.on('activate', () => {
  mainWindow?.show();
});

app.on('will-quit', () => {
  if (app.isReady()) {
    unregisterHotkeys();
  }
  if (overlayHideTimer) {
    clearTimeout(overlayHideTimer);
    overlayHideTimer = null;
  }
  recorder?.cleanup();
});

// Prevent multiple instances
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

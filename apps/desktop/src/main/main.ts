// apps/desktop/src/main/main.ts
import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  clipboard,
  Tray,
  Menu,
  nativeImage,
  shell,
  Notification,
} from 'electron';
import path from 'path';
import { AudioRecorder } from './audio-recorder';
import { store } from './store';
import { setupAutoUpdater } from './updater';
import { captureForegroundWindow, pasteText } from './windows-input';

// ─── Constants ────────────────────────────────────────────────────
const isDev = process.env.NODE_ENV === 'development';
const DEV_RENDERER_URL = 'http://localhost:5173';

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('inumaki', process.execPath, [path.resolve(process.argv[1])])
  }
} else {
  app.setAsDefaultProtocolClient('inumaki')
}

// ─── State ────────────────────────────────────────────────────────
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let recorder: AudioRecorder | null = null;
let currentHotkey = store.get('hotkey', 'Control+Shift+Space') as string;

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

  // Handle first-launch deep link on Windows
  if (process.platform === 'win32') {
    const deepLinkUrl = process.argv.find((arg) => arg.startsWith('inumaki://'));
    if (deepLinkUrl) {
      setTimeout(() => handleDeepLink(deepLinkUrl), 1000);
    }
  }
}

// ─── Deep Linking ──────────────────────────────────────────────────
function handleDeepLink(url: string) {
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol === 'inumaki:' && urlObj.hostname === 'auth') {
      const token = urlObj.searchParams.get('token');
      const code = urlObj.searchParams.get('code');
      const base = urlObj.searchParams.get('base');
      if ((token || code) && mainWindow) {
        mainWindow.webContents.send('deep-link-token', { token, code, base });
        mainWindow.show();
        mainWindow.focus();
      }
    }
  } catch (err) {
    console.error('Failed to parse deep link:', err);
  }
}

app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

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

// ─── Hotkey Registration ──────────────────────────────────────────
function registerHotkey(hotkey: string) {
  globalShortcut.unregisterAll();

  const registered = globalShortcut.register(hotkey, () => {
    if (!recorder) return;

    if (recorder.isRecording()) {
      stopRecording();
    } else {
      startRecording();
    }
  });

  if (!registered) {
    console.error(`Failed to register hotkey: ${hotkey}`);
    // Try fallback
    globalShortcut.register('Control+Shift+Space', () => {
      if (!recorder?.isRecording()) startRecording();
      else stopRecording();
    });
  }
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
}

function stopRecording() {
  if (!recorder || !recorder.isRecording()) return;

  recorder.stop();
  mainWindow?.webContents.send('recording-state-change', { state: 'processing' });
  updateTrayMenu('Processing…');

  // The renderer holds the captured audio — tell it to stop, encode, and process.
  // It posts to the API and, on success, calls pasteText/copyText back to main.
  mainWindow?.webContents.send('process-audio');
}

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
    currentHotkey = hotkey;
    store.set('hotkey', hotkey);
    registerHotkey(hotkey);
  });

  // State feedback from renderer
  ipcMain.on('process-audio-result', (_event, { state, message }) => {
    mainWindow?.webContents.send('recording-state-change', { state, message });
    updateTrayMenu(state === 'success' ? 'Done' : state);
    setTimeout(() => updateTrayMenu(), 3000);
  });

  // Window controls
  ipcMain.on('window-minimize', () => mainWindow?.minimize());
  ipcMain.on('window-hide', () => mainWindow?.hide());
  ipcMain.on('window-close', () => mainWindow?.hide());

  // Store access
  ipcMain.handle('store-get', (_event, key: string) => store.get(key));
  ipcMain.handle('store-set', (_event, key: string, value: unknown) => {
    store.set(key, value);
  });

  // Open external auth
  ipcMain.on('open-auth', (_event, url: string) => {
    shell.openExternal(url);
  });
}

// ─── App Lifecycle ────────────────────────────────────────────────
app.whenReady().then(async () => {
  createMainWindow();
  createTray();
  setupIpc();

  recorder = new AudioRecorder();

  // Register hotkey
  const savedHotkey = store.get('hotkey', 'Control+Shift+Space') as string;
  registerHotkey(savedHotkey);

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
    globalShortcut.unregisterAll();
  }
  recorder?.cleanup();
});

// Prevent multiple instances
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, argv) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
    
    // Windows/Linux deep link processing in second instance
    const url = argv.find((arg) => arg.startsWith('inumaki://'));
    if (url) {
      handleDeepLink(url);
    }
  });
}

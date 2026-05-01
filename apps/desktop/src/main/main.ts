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

// ─── Constants ────────────────────────────────────────────────────
const isDev = process.env.NODE_ENV === 'development';
const RENDERER_URL = isDev
  ? 'http://localhost:5173'
  : `file://${path.join(__dirname, '../../renderer/index.html')}`;

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
let pendingDeepLink:
  | {
      token?: string | null;
      code?: string | null;
      base?: string | null;
    }
  | null = null;

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

  mainWindow.loadURL(RENDERER_URL);

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
      if (token || code) {
        pendingDeepLink = { token, code, base };
        mainWindow?.webContents.send('deep-link-token', pendingDeepLink);
        mainWindow?.show();
        mainWindow?.focus();
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
  if (!recorder) return;
  recorder.start();
  mainWindow?.webContents.send('recording-state-change', {
    state: 'recording',
  });
  updateTrayMenu('Recording…');
}

async function stopRecording() {
  if (!recorder || !recorder.isRecording()) return;

  mainWindow?.webContents.send('recording-state-change', { state: 'processing' });
  updateTrayMenu('Processing…');

  const result = await recorder.stop();
  if (!result) {
    mainWindow?.webContents.send('recording-state-change', {
      state: 'error',
      message: 'No audio captured',
    });
    updateTrayMenu('Error');
    return;
  }

  // Send to renderer for API call
  mainWindow?.webContents.send('process-audio', result);
}

// ─── IPC Handlers ────────────────────────────────────────────────
function setupIpc() {
  // Paste text into previously focused window
  ipcMain.on('paste-text', (_event, text: string) => {
    clipboard.writeText(text);
    // Small delay to let clipboard update
    setTimeout(() => {
      // On Windows, simulate Ctrl+V on the previously focused window
      // The renderer handles auto-paste via robot.js or clipboard only
    }, 100);
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

  ipcMain.handle('auth-get-pending-link', () => {
    const payload = pendingDeepLink;
    pendingDeepLink = null;
    return payload;
  });

  ipcMain.handle('auth-exchange-code', async (_event, base: string, code: string) => {
    const res = await fetch(`${base.replace(/\/$/, '')}/api/auth/desktop/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(typeof data.error === 'string' ? data.error : 'Desktop auth exchange failed');
    }
    return data;
  });

  ipcMain.handle('auth-verify-token', async (_event, base: string, token: string) => {
    const res = await fetch(`${base.replace(/\/$/, '')}/api/auth/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(typeof data.error === 'string' ? data.error : 'Invalid token');
    }
    return data;
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

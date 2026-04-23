// apps/desktop/src/main/updater.ts
import { autoUpdater } from 'electron-updater';
import { dialog, app } from 'electron';

export function setupAutoUpdater() {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
    dialog
      .showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: `Inumaki AI v${info.version} is available. Download now?`,
        buttons: ['Download', 'Later'],
      })
      .then(({ response }) => {
        if (response === 0) autoUpdater.downloadUpdate();
      });
  });

  autoUpdater.on('update-downloaded', () => {
    dialog
      .showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'Update downloaded. Restart now to apply?',
        buttons: ['Restart', 'Later'],
      })
      .then(({ response }) => {
        if (response === 0) autoUpdater.quitAndInstall();
      });
  });

  autoUpdater.on('error', (err) => {
    console.error('AutoUpdater error:', err);
  });

  // Check on startup + every 4 hours
  autoUpdater.checkForUpdates();
  setInterval(() => autoUpdater.checkForUpdates(), 4 * 60 * 60 * 1000);
}

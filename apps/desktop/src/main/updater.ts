// apps/desktop/src/main/updater.ts
//
// Auto-update via electron-updater against GitHub releases (Camie-Tech/inumaki).
// On launch and every few hours the app reads the latest release's latest.yml,
// downloads a newer NSIS installer in the background, and offers a one-click
// restart to apply it — no manual re-install. Requires the `publish` config in
// package.json (bakes app-update.yml into the build) and a `latest.yml` asset on
// the release. Only the INSTALLED (NSIS) build self-updates; the portable does not.
import { autoUpdater } from 'electron-updater';
import { dialog, Notification } from 'electron';

export function setupAutoUpdater() {
  autoUpdater.autoDownload = true; // fetch the update as soon as one is found
  autoUpdater.autoInstallOnAppQuit = true; // also apply on a normal quit

  autoUpdater.on('checking-for-update', () => {
    console.log('[updater] checking for updates…');
  });

  autoUpdater.on('update-available', (info) => {
    console.log(`[updater] update available: v${info.version}`);
    new Notification({
      title: 'Inumaki AI',
      body: `Downloading update v${info.version}…`,
      silent: true,
    }).show();
  });

  autoUpdater.on('update-not-available', () => {
    console.log('[updater] up to date');
  });

  autoUpdater.on('download-progress', (p) => {
    console.log(`[updater] downloading ${Math.round(p.percent)}%`);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log(`[updater] downloaded v${info.version}`);
    dialog
      .showMessageBox({
        type: 'info',
        title: 'Update ready',
        message: `Inumaki AI v${info.version} has been downloaded.`,
        detail: 'Restart now to apply the update? Your work is on the clipboard either way.',
        buttons: ['Restart now', 'Later'],
        defaultId: 0,
        cancelId: 1,
      })
      .then(({ response }) => {
        if (response === 0) autoUpdater.quitAndInstall();
      })
      .catch((err) => console.error('[updater] restart prompt failed:', err));
  });

  autoUpdater.on('error', (err) => {
    // Network hiccups / no release yet shouldn't crash or nag the user.
    console.error('[updater] error:', err);
  });

  // Check on startup, then every 4 hours.
  autoUpdater.checkForUpdates().catch((err) => console.error('[updater] initial check failed:', err));
  setInterval(
    () => {
      autoUpdater.checkForUpdates().catch(() => {});
    },
    4 * 60 * 60 * 1000
  );
}

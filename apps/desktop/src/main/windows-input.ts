// apps/desktop/src/main/windows-input.ts
//
// Windows text injection for the dictation flow (P0).
//
// The clipboard write is the reliable, always-on path: even if keystroke
// simulation fails, the transcript is on the clipboard and the user can paste
// manually — so auto-paste is a best-effort convenience layered on top and can
// never regress below "text is on the clipboard".
//
// Strategy on Windows:
//   1. Capture the foreground window when recording starts (the user's target
//      app, since the tray window never steals focus during the hotkey flow).
//   2. At paste time: save the user's clipboard, write the transcript, bring the
//      captured window forward (AttachThreadInput + SetForegroundWindow), send
//      Ctrl+V via SendKeys, then restore the previous clipboard.
//
// Implemented with PowerShell + Win32 (user32) so there is no native addon to
// compile or unpack from the asar. A native SendInput backend can replace the
// PowerShell calls later for lower latency without changing callers.
import { execFile } from 'node:child_process';
import { clipboard } from 'electron';

const isWindows = process.platform === 'win32';

// Captured at record-start; the user's target window for the next paste.
let capturedWindowHandle: string | null = null;

// user32/kernel32 P/Invoke surface. Built as a line array so the closing `"@`
// of the here-string sits at column 0 (PowerShell requires it).
const USER32_TYPE = [
  'Add-Type @"',
  'using System;',
  'using System.Runtime.InteropServices;',
  'public static class InumakiU32 {',
  '  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();',
  '  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);',
  '  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);',
  '  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hWnd);',
  '  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint pid);',
  '  [DllImport("user32.dll")] public static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool fAttach);',
  '  [DllImport("kernel32.dll")] public static extern uint GetCurrentThreadId();',
  '}',
  '"@',
].join('\n');

function runPowerShell(script: string, timeoutMs = 5000): Promise<string> {
  return new Promise((resolve) => {
    const child = execFile(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script],
      { timeout: timeoutMs, windowsHide: true },
      (err, stdout) => {
        if (err) {
          resolve('');
          return;
        }
        resolve((stdout ?? '').trim());
      }
    );
    child.on('error', () => resolve(''));
  });
}

/**
 * Remember the currently focused window so we can paste back into it later.
 * Call this the instant recording starts (from the global hotkey), while the
 * user's target app is still in the foreground. No-op off Windows.
 */
export async function captureForegroundWindow(): Promise<void> {
  capturedWindowHandle = null;
  if (!isWindows) return;
  const out = await runPowerShell(
    `${USER32_TYPE}\n[InumakiU32]::GetForegroundWindow().ToInt64()`,
    4000
  );
  // Only keep a clean, non-zero integer handle.
  if (/^-?\d+$/.test(out) && out !== '0') {
    capturedWindowHandle = out;
  }
}

/**
 * Write `text` to the clipboard and (on Windows) paste it into the captured
 * window via Ctrl+V, restoring the user's previous clipboard afterwards.
 * Always succeeds at the clipboard step; the keystroke is best-effort.
 */
export async function pasteText(text: string): Promise<void> {
  // 1. Reliable path: always put the transcript on the clipboard.
  const previous = clipboard.readText();
  clipboard.writeText(text);

  if (!isWindows) return; // other platforms: clipboard only, user pastes manually

  // 2. Best-effort: focus the captured window and send Ctrl+V.
  const hwnd = capturedWindowHandle;
  const script = hwnd
    ? [
        USER32_TYPE,
        `$h = [IntPtr]${hwnd}`,
        'if ([InumakiU32]::IsIconic($h)) { [InumakiU32]::ShowWindow($h, 9) | Out-Null }',
        '$fg = [InumakiU32]::GetForegroundWindow()',
        '$procId = [uint32]0',
        '$tIn = [InumakiU32]::GetWindowThreadProcessId($fg, [ref]$procId)',
        '$tCur = [InumakiU32]::GetCurrentThreadId()',
        '[InumakiU32]::AttachThreadInput($tCur, $tIn, $true) | Out-Null',
        '[InumakiU32]::SetForegroundWindow($h) | Out-Null',
        '[InumakiU32]::AttachThreadInput($tCur, $tIn, $false) | Out-Null',
        'Start-Sleep -Milliseconds 60',
        'Add-Type -AssemblyName System.Windows.Forms',
        "[System.Windows.Forms.SendKeys]::SendWait('^v')",
      ].join('\n')
    : [
        'Add-Type -AssemblyName System.Windows.Forms',
        "[System.Windows.Forms.SendKeys]::SendWait('^v')",
      ].join('\n');

  await runPowerShell(script, 6000);

  // 3. Restore the user's prior clipboard once the paste has been processed.
  //    SendWait is synchronous, so the paste is done by the time we get here.
  if (previous) {
    setTimeout(() => {
      try {
        clipboard.writeText(previous);
      } catch {
        // ignore — not worth surfacing a clipboard-restore failure
      }
    }, 400);
  }
}

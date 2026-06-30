export const DEFAULT_HOTKEY = 'Windows+Alt';
export const LEGACY_DEFAULT_HOTKEY = 'Control+Shift+Space';

export const HOTKEY_OPTIONS = [
  DEFAULT_HOTKEY,
  'Control+Alt+Space',
  'Alt+Shift+R',
  'Control+Shift+R',
];

export function normalizeHotkey(value: unknown): string {
  if (typeof value !== 'string') return DEFAULT_HOTKEY;
  const hotkey = value.trim();
  if (hotkey === LEGACY_DEFAULT_HOTKEY) return DEFAULT_HOTKEY;
  return hotkey.length > 0 ? hotkey : DEFAULT_HOTKEY;
}

export function shouldMigrateHotkey(value: unknown): boolean {
  return value === undefined || value === null || value === '' || value === LEGACY_DEFAULT_HOTKEY;
}

export function isWindowsAltHotkey(hotkey: string): boolean {
  const parts = hotkey
    .split('+')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);

  if (parts.length !== 2) return false;

  const hasAlt = parts.includes('alt');
  const hasWindows = parts.some((part) =>
    ['windows', 'window', 'win', 'meta', 'super'].includes(part)
  );

  return hasAlt && hasWindows;
}

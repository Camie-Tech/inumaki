// Side-effect CSS imports in the renderer (e.g. `import './index.css'`).
declare module '*.css';

// Electron frameless-window drag regions used in inline styles (TitleBar).
import 'react';
declare module 'react' {
  interface CSSProperties {
    WebkitAppRegion?: 'drag' | 'no-drag';
    appRegion?: 'drag' | 'no-drag';
  }
}

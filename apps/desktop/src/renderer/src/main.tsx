// apps/desktop/src/renderer/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { OverlayHUD } from './overlay/OverlayHUD';
// Side-effect CSS import is bundled by Vite, not tsc. TS wildcard module
// declarations don't match relative specifiers, so suppress the resolution error.
// @ts-expect-error -- handled by Vite's CSS pipeline
import './index.css';

// The same bundle backs both the main window and the lightweight listening HUD;
// the HUD window loads index.html with a `#overlay` hash (see main.ts).
const isOverlay = window.location.hash.replace(/^#/, '') === 'overlay';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{isOverlay ? <OverlayHUD /> : <App />}</React.StrictMode>
);

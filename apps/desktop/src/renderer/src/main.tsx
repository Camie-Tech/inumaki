// apps/desktop/src/renderer/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Side-effect CSS import is bundled by Vite, not tsc. TS wildcard module
// declarations don't match relative specifiers, so suppress the resolution error.
// @ts-ignore -- handled by Vite's CSS pipeline
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

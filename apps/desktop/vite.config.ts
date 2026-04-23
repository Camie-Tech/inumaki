// apps/desktop/vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import electronPlugin from 'vite-plugin-electron/simple';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '../../'), '');
  const apiServer = env.AUTH_URL || env.NEXTAUTH_URL || 'http://localhost:3000';

  return {
    define: {
      __API_SERVER__: JSON.stringify(apiServer),
    },
    plugins: [
      react(),
      electronPlugin({
        main: {
          entry: path.resolve(__dirname, 'src/main/main.ts'),
          vite: {
            build: {
              outDir: path.resolve(__dirname, 'dist/main'),
            },
          },
        },
        preload: {
          input: path.resolve(__dirname, 'src/main/preload.ts'),
          vite: {
            build: {
              outDir: path.resolve(__dirname, 'dist/main'),
            },
          },
        },
      }),
    ],
    root: 'src/renderer',
    base: './',
    build: {
      outDir: path.resolve(__dirname, 'dist/renderer'),
      emptyOutDir: true,
    },
    server: {
      port: 5173,
      strictPort: true,
    },
    resolve: {
      alias: {
        '@inumaki/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      },
    },
  };
});

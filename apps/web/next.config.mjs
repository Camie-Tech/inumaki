// apps/web/next.config.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Pin the workspace root so Turbopack resolves modules from the monorepo
// instead of guessing (a stray parent-folder lockfile otherwise misleads it).
const workspaceRoot = path.resolve(__dirname, '..', '..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@inumaki/shared'],
  turbopack: {
    root: workspaceRoot,
  },
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
};

export default nextConfig;

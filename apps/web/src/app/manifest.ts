import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Inumaki — Local voice-to-text for Windows',
    short_name: 'Inumaki',
    description:
      'Free, open-source local voice-to-text for Windows. 100% on-device transcription via whisper.cpp.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0f14',
    theme_color: '#0b0f14',
    icons: [
      {
        src: '/brand/inumaki-icon-dark.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}

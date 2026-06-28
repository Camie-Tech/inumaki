import type { MetadataRoute } from 'next';
import { PRODUCT_DESCRIPTION } from '@/lib/marketing';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Inumaki - Voice-to-text for Windows',
    short_name: 'Inumaki',
    description: PRODUCT_DESCRIPTION,
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

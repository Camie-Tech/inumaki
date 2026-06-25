// apps/web/src/app/layout.tsx
import type { Metadata } from 'next';
import { IBM_Plex_Mono, Inter, Orbitron, Syne } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-orbitron',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.camie.tech'),
  title: 'Inumaki — Local voice-to-text for Windows',
  description:
    'Press a global hotkey, speak in any Windows app, and paste clean text. 100% local transcription via whisper.cpp. Open source, MIT, by Camie Tech.',
  icons: {
    icon: '/brand/inumaki-icon-dark.png',
    apple: '/brand/inumaki-icon-dark.png',
  },
  openGraph: {
    title: 'Inumaki — Local voice-to-text for Windows',
    description:
      'Press a hotkey, speak, and paste clean text. 100% local transcription via whisper.cpp. Open source, by Camie Tech.',
    url: 'https://www.camie.tech',
    siteName: 'Camie Tech',
    images: [
      {
        url: '/brand/inumaki-wordmark-blue.png',
        width: 1536,
        height: 1024,
        alt: 'Inumaki AI',
      },
    ],
  },
};

export const viewport = {
  themeColor: '#0b0f14',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${syne.variable} ${orbitron.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
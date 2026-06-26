// apps/web/src/app/layout.tsx
import type { Metadata } from 'next';
import { IBM_Plex_Mono, Inter, Orbitron, Syne } from 'next/font/google';
import { SITE_URL } from '@/lib/site';
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Inumaki — Free Local Voice-to-Text for Windows',
    template: '%s · Inumaki',
  },
  description:
    'Free, open-source voice-to-text for Windows. Press Ctrl+Shift+Space, speak in any app, and paste clean text. 100% local transcription via whisper.cpp — your audio never leaves your PC.',
  applicationName: 'Inumaki',
  authors: [{ name: 'Camie Tech', url: 'https://www.camie.tech' }],
  creator: 'Camie Tech',
  publisher: 'Camie Tech',
  category: 'productivity',
  keywords: [
    'voice to text windows',
    'local dictation app',
    'offline speech to text windows',
    'whisper dictation app',
    'open source voice to text',
    'wispr flow alternative',
    'private voice typing',
    'free dictation software',
    'whisper.cpp dictation',
    'no subscription dictation',
  ],
  alternates: { canonical: '/' },
  icons: {
    icon: '/brand/inumaki-icon-dark.png',
    apple: '/brand/inumaki-icon-dark.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    title: 'Inumaki — Free Local Voice-to-Text for Windows',
    description:
      'Press a hotkey, speak in any Windows app, and paste clean text. 100% local transcription via whisper.cpp. Open source, no account, by Camie Tech.',
    url: SITE_URL,
    siteName: 'Inumaki',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inumaki — Free Local Voice-to-Text for Windows',
    description:
      'Press a hotkey, speak in any Windows app, and paste clean text. 100% local, open source, no account.',
  },
};

export const viewport = {
  themeColor: '#0b0f14',
  colorScheme: 'dark' as const,
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
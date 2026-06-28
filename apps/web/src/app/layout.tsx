// apps/web/src/app/layout.tsx
import type { Metadata } from 'next';
import { IBM_Plex_Mono, Inter, Orbitron, Syne } from 'next/font/google';
import { SITE_URL } from '@/lib/site';
import { PRODUCT_DESCRIPTION, PRODUCT_TITLE, SEO_KEYWORDS } from '@/lib/marketing';
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
    default: PRODUCT_TITLE,
    template: '%s - Inumaki',
  },
  description: PRODUCT_DESCRIPTION,
  applicationName: 'Inumaki',
  authors: [{ name: 'Camie Tech', url: 'https://www.camie.tech' }],
  creator: 'Camie Tech',
  publisher: 'Camie Tech',
  category: 'productivity',
  keywords: SEO_KEYWORDS,
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
    title: PRODUCT_TITLE,
    description: PRODUCT_DESCRIPTION,
    url: SITE_URL,
    siteName: 'Inumaki',
  },
  twitter: {
    card: 'summary_large_image',
    title: PRODUCT_TITLE,
    description: PRODUCT_DESCRIPTION,
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

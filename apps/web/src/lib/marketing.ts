import type { Metadata } from 'next';
import type { MetadataRoute } from 'next';
import { SITE_URL } from './site';

type IndexableRoute = {
  path: string;
  lastModified: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
};

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

export const HOTKEY = 'Ctrl+Shift+Space';

export const PRODUCT_TITLE = 'Inumaki - Free Local Voice-to-Text for Windows';

export const PRODUCT_DESCRIPTION =
  'Free, open-source voice-to-text for Windows. Press Ctrl+Shift+Space, speak in any app, and paste clean text. 100% local transcription via whisper.cpp.';

export const PROCESSING_DISCLOSURE =
  'Transcription runs locally on your Windows PC with whisper.cpp. No account, no cloud transcription, and no personal API key are required.';

export const SEO_KEYWORDS = [
  'voice to text windows',
  'windows dictation app',
  'local dictation app',
  'speech to text windows',
  'open source voice to text',
  'free dictation software',
  'offline speech to text windows',
  'whisper.cpp dictation',
  'private voice typing',
  'no cloud dictation windows',
  'global hotkey dictation',
  'Wispr Flow alternative',
];

export const INDEXABLE_ROUTES: IndexableRoute[] = [
  { path: '/', lastModified: '2026-06-28', changeFrequency: 'weekly', priority: 1 },
  {
    path: '/wispr-flow-alternative',
    lastModified: '2026-06-28',
    changeFrequency: 'monthly',
    priority: 0.85,
  },
  {
    path: '/privacy',
    lastModified: '2026-06-28',
    changeFrequency: 'monthly',
    priority: 0.75,
  },
  {
    path: '/help',
    lastModified: '2026-06-28',
    changeFrequency: 'monthly',
    priority: 0.7,
  },
];

export function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

export function pageMetadata({
  title,
  description,
  path,
  keywords = [],
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    keywords: [...SEO_KEYWORDS, ...keywords],
    openGraph: {
      type: 'website',
      title,
      description,
      url: absoluteUrl(path),
      siteName: 'Inumaki',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Single-page marketing site: only the homepage is indexable. App/auth routes
// are intentionally excluded (also disallowed in robots.ts). Add content pages
// (e.g. /wispr-flow-alternative) here as they ship.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}

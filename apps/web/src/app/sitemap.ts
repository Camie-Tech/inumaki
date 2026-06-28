import type { MetadataRoute } from 'next';
import { absoluteUrl, INDEXABLE_ROUTES } from '@/lib/marketing';

// Only marketing/help content is indexable. App/auth routes stay excluded and
// disallowed in robots.ts.
export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXABLE_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: new Date(route.lastModified),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

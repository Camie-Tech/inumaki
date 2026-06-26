import { NextResponse } from 'next/server';
import { INUMAKI_DOWNLOAD_URL } from '@/lib/github-release';

export const dynamic = 'force-dynamic';

// Backwards-compatible alias for any existing links: redirect straight to
// GitHub's "latest release" installer download. GitHub keeps this current
// automatically, so there's no API call and no rate limit.
export async function GET() {
  const response = NextResponse.redirect(INUMAKI_DOWNLOAD_URL, 302);
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('X-Robots-Tag', 'noindex');
  return response;
}

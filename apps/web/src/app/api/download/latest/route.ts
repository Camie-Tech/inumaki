import { NextResponse } from 'next/server';
import {
  getLatestInumakiRelease,
  INUMAKI_RELEASES_URL,
  selectWindowsDownloadAsset,
} from '@/lib/github-release';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const release = await getLatestInumakiRelease({ cache: 'no-store', timeoutMs: 8000 });
    const asset = selectWindowsDownloadAsset(release);
    const target = asset?.browser_download_url ?? release.html_url ?? INUMAKI_RELEASES_URL;
    const response = NextResponse.redirect(target, 302);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch {
    const response = NextResponse.redirect(INUMAKI_RELEASES_URL, 302);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }
}

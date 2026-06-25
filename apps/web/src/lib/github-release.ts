export const INUMAKI_RELEASE_REPO =
  process.env.INUMAKI_RELEASE_REPO?.trim() || 'Camie-Tech/inumaki-oss';

export const INUMAKI_RELEASES_URL = `https://github.com/${INUMAKI_RELEASE_REPO}/releases/latest`;

export interface GitHubReleaseAsset {
  name: string;
  browser_download_url: string;
  content_type?: string;
  size?: number;
}

export interface GitHubRelease {
  tag_name: string;
  name?: string;
  html_url: string;
  published_at?: string;
  assets: GitHubReleaseAsset[];
}

type ReleaseFetchOptions = {
  cache?: RequestCache;
  revalidate?: number;
  timeoutMs?: number;
};

export async function getLatestInumakiRelease(
  options: ReleaseFetchOptions = {}
): Promise<GitHubRelease> {
  const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'inumaki-web',
    },
  };

  if (options.cache) {
    fetchOptions.cache = options.cache;
  }

  if (typeof options.revalidate === 'number') {
    fetchOptions.next = { revalidate: options.revalidate };
  }

  fetchOptions.signal = AbortSignal.timeout(options.timeoutMs ?? 4500);

  const response = await fetch(
    `https://api.github.com/repos/${INUMAKI_RELEASE_REPO}/releases/latest`,
    fetchOptions
  );

  if (!response.ok) {
    throw new Error(`GitHub release lookup failed with ${response.status}`);
  }

  return (await response.json()) as GitHubRelease;
}

export function selectWindowsDownloadAsset(release: GitHubRelease): GitHubReleaseAsset | null {
  const assets = release.assets ?? [];
  return (
    assets.find((asset) => /inumaki.*x64.*\.exe$/i.test(asset.name)) ??
    assets.find((asset) => /\.exe$/i.test(asset.name)) ??
    assets.find((asset) => /win.*unpacked.*\.zip$/i.test(asset.name)) ??
    assets.find((asset) => /\.zip$/i.test(asset.name)) ??
    null
  );
}

export function formatReleaseSize(size?: number): string {
  if (!size || size <= 0) return 'Release asset';
  const mb = size / 1024 / 1024;
  return `${mb.toFixed(mb >= 100 ? 0 : 1)} MB`;
}

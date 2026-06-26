// Repo whose latest GitHub release the site serves. Overridable per-environment
// via INUMAKI_RELEASE_REPO; defaults to the actively-released app repo so the
// download + version always track the newest published release automatically.
export const INUMAKI_RELEASE_REPO =
  process.env.INUMAKI_RELEASE_REPO?.trim() || 'Camie-Tech/inumaki';

export const INUMAKI_RELEASES_URL = `https://github.com/${INUMAKI_RELEASE_REPO}/releases/latest`;

export const INUMAKI_REPO_URL = `https://github.com/${INUMAKI_RELEASE_REPO}`;

// Stable, version-less installer asset name. electron-builder emits this exact
// name on every release, so the GitHub "latest" download URL below always
// resolves to the newest installer — no API call and no rate limit.
export const INUMAKI_INSTALLER_ASSET = 'Inumaki-AI-Setup.exe';

// Direct "always latest" download — GitHub redirects /releases/latest/download/
// to the newest release's matching asset automatically.
export const INUMAKI_DOWNLOAD_URL = `${INUMAKI_REPO_URL}/releases/latest/download/${INUMAKI_INSTALLER_ASSET}`;

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

// Server-side, ISR-cached star count for the OSS repo — the cheapest, highest
// signal credibility cue for an unknown open-source brand. Fails soft (null).
export async function getInumakiRepoStars(
  options: ReleaseFetchOptions = {}
): Promise<number | null> {
  try {
    const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'inumaki-web',
      },
      signal: AbortSignal.timeout(options.timeoutMs ?? 3000),
    };
    if (options.cache) fetchOptions.cache = options.cache;
    if (typeof options.revalidate === 'number') {
      fetchOptions.next = { revalidate: options.revalidate };
    }

    const response = await fetch(
      `https://api.github.com/repos/${INUMAKI_RELEASE_REPO}`,
      fetchOptions
    );
    if (!response.ok) return null;
    const data = (await response.json()) as { stargazers_count?: number };
    return typeof data.stargazers_count === 'number' ? data.stargazers_count : null;
  } catch {
    return null;
  }
}

// Used only for the displayed size chip / null-state fallback — the download
// itself goes straight to INUMAKI_DOWNLOAD_URL. Prefers the NSIS installer and
// ignores the .blockmap / latest.yml metadata; resilient to versioned or stable
// asset names.
export function selectWindowsDownloadAsset(release: GitHubRelease): GitHubReleaseAsset | null {
  const assets = (release.assets ?? []).filter(
    (asset) => asset?.name && !/\.blockmap$/i.test(asset.name)
  );
  const exes = assets.filter((asset) => /\.exe$/i.test(asset.name));
  return (
    exes.find((asset) => /setup/i.test(asset.name)) ??
    exes.find((asset) => /x64/i.test(asset.name) && !/portable/i.test(asset.name)) ??
    exes.find((asset) => !/portable/i.test(asset.name)) ??
    exes[0] ??
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

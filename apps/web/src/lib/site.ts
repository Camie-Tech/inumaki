// Canonical public origin for the Inumaki marketing site.
//
// Defaults to the live Vercel deployment so canonical, OG image, sitemap, and
// robots always resolve to a crawlable host — even if the env var is unset.
// Once `inumaki.camie.tech` DNS resolves, set
//   NEXT_PUBLIC_SITE_URL=https://inumaki.camie.tech
// in the Vercel project (and 308-redirect the *.vercel.app host to it). No code
// change is then needed — canonical/OG/sitemap all follow the env var.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://inumaki-five.vercel.app'
).replace(/\/+$/, '');

import Image from 'next/image';
import {
  INUMAKI_DOWNLOAD_URL,
  INUMAKI_RELEASES_URL,
  INUMAKI_REPO_URL,
} from '@/lib/github-release';

export function JsonLdScript({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

export function MarketingPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-200 antialiased selection:bg-[#00aeef]/30 selection:text-white">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0b0f14]" />
        <div className="absolute left-1/2 top-[-20%] h-[56vh] w-[110vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(0,174,239,0.18),transparent_70%)] blur-3xl" />
        <div className="ink-grid absolute inset-0" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(11,15,20,0.58)_55%,#0b0f14)]" />
      </div>
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0b0f14]/75 backdrop-blur-xl">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        <a
          href="/"
          className="group flex items-center gap-3 rounded-2xl px-1 py-1 outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14]"
        >
          <Image
            src="/brand/inumaki-icon-dark-transparent.png"
            alt=""
            width={40}
            height={40}
            priority
            className="h-10 w-10 object-contain"
          />
          <span className="flex flex-col leading-none">
            <span
              className="text-[0.62rem] font-medium uppercase tracking-[0.32em] text-slate-400"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              Camie Tech
            </span>
            <span
              className="text-lg font-bold tracking-[0.14em] text-white"
              style={{ fontFamily: 'var(--font-orbitron)' }}
            >
              INUMAKI
            </span>
          </span>
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="/help"
            className="hidden min-h-[44px] items-center rounded-full px-3 text-sm font-medium text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14] md:inline-flex"
          >
            Help
          </a>
          <a
            href="/privacy"
            className="hidden min-h-[44px] items-center rounded-full px-3 text-sm font-medium text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14] md:inline-flex"
          >
            Privacy
          </a>
          <a
            href={INUMAKI_DOWNLOAD_URL}
            className="inline-flex min-h-[44px] items-center rounded-full bg-[#00aeef] px-5 text-sm font-semibold text-[#04131c] shadow-[0_8px_24px_-8px_rgba(0,174,239,0.7)] transition-colors hover:bg-[#42caff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14]"
          >
            Download
          </a>
        </div>
      </nav>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/brand/inumaki-icon-dark-transparent.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <p
              className="text-sm font-bold tracking-[0.12em] text-white"
              style={{ fontFamily: 'var(--font-orbitron)' }}
            >
              INUMAKI
            </p>
          </div>
          <p className="mt-4 max-w-xs text-sm text-slate-400">
            Free open-source voice-to-text for Windows, maintained by Camie Tech.
          </p>
        </div>

        <FooterColumn title="Product">
          <FooterLink href={INUMAKI_DOWNLOAD_URL}>Download</FooterLink>
          <FooterLink href="/help">Install guide</FooterLink>
          <FooterLink href="/#faq">FAQ</FooterLink>
          <FooterLink href={INUMAKI_RELEASES_URL} external>
            Release notes
          </FooterLink>
        </FooterColumn>

        <FooterColumn title="Learn">
          <FooterLink href="/privacy">Privacy & processing</FooterLink>
          <FooterLink href="/wispr-flow-alternative">Wispr Flow alternative</FooterLink>
          <FooterLink href={INUMAKI_REPO_URL} external>
            GitHub source
          </FooterLink>
        </FooterColumn>

        <FooterColumn title="Open source">
          <FooterLink href={`${INUMAKI_REPO_URL}/issues`} external>
            Report an issue
          </FooterLink>
          <FooterLink href={`${INUMAKI_REPO_URL}/blob/main/LICENSE`} external>
            License (MIT)
          </FooterLink>
          <FooterLink href="https://www.camie.tech" external>
            Camie Tech
          </FooterLink>
        </FooterColumn>
      </div>
    </footer>
  );
}

export function PageHero({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-10 pt-16 text-center sm:px-6 sm:pb-14 sm:pt-24">
      <p
        className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7fdcff]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {eyebrow}
      </p>
      <h1
        className="mx-auto mt-5 max-w-4xl text-balance text-4xl font-semibold leading-[1.08] text-white sm:text-6xl"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h1>
      <div className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
        {children}
      </div>
    </section>
  );
}

export function ContentBand({ children }: { children: React.ReactNode }) {
  return <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">{children}</section>;
}

export function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-white/[0.07] bg-white/[0.025] p-6 sm:p-8">
      {children}
    </div>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="text-[0.62rem] font-medium uppercase tracking-[0.32em] text-slate-400"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {title}
      </p>
      <ul className="mt-4 flex flex-col gap-1">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  external = false,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  const externalProps = external ? { target: '_blank', rel: 'noreferrer noopener' } : {};
  return (
    <li>
      <a
        href={href}
        {...externalProps}
        className="inline-flex min-h-[40px] items-center rounded text-sm text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14]"
      >
        {children}
      </a>
    </li>
  );
}

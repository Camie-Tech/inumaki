import type { Metadata } from 'next';
import {
  ContentBand,
  InfoCard,
  JsonLdScript,
  MarketingPage,
  PageHero,
} from '../_components/marketing-page';
import { INUMAKI_DOWNLOAD_URL, INUMAKI_RELEASES_URL } from '@/lib/github-release';
import { absoluteUrl, HOTKEY, pageMetadata, PROCESSING_DISCLOSURE } from '@/lib/marketing';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Install and Use Inumaki on Windows',
  description:
    'Download Inumaki for Windows, handle SmartScreen, use the Ctrl+Shift+Space hotkey, and troubleshoot common voice-to-text setup issues.',
  path: '/help',
  keywords: [
    'install Inumaki',
    'Inumaki hotkey',
    'Windows voice to text setup',
    'SmartScreen open source app',
    'dictation app troubleshooting',
  ],
});

const installSteps = [
  {
    title: 'Download the Windows installer',
    body: 'Use the latest GitHub release installer from the Download button. Inumaki currently targets Windows 10 and 11 on x64.',
  },
  {
    title: 'Run the unsigned installer',
    body: 'Windows SmartScreen can warn for unsigned indie apps. Choose More info, then Run anyway if you trust the source or have reviewed the code.',
  },
  {
    title: 'Finish first-run setup',
    body: 'The desktop app shows a short onboarding flow, then keeps Inumaki running in the tray.',
  },
  {
    title: 'Press the hotkey',
    body: `Use ${HOTKEY}, speak, then paste the cleaned output where you were working.`,
  },
];

const troubleshooting = [
  {
    title: 'The app opens a browser auth page',
    body: 'That is stale behavior. Current OSS builds should go straight to onboarding, not browser sign-in.',
  },
  {
    title: 'No text appears',
    body: 'Check microphone permissions, confirm the active app accepts paste, and try pasting manually from the clipboard.',
  },
  {
    title: 'Processing fails',
    body: 'Confirm microphone permissions, check that the local transcription assets are available, and restart the desktop app.',
  },
  {
    title: 'SmartScreen blocks launch',
    body: 'The app is not code-signed yet. Build from source or use More info -> Run anyway only if you trust the release.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'HowTo',
      '@id': `${SITE_URL}/help#howto`,
      name: 'How to install and use Inumaki on Windows',
      description: metadata.description,
      step: installSteps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.title,
        text: step.body,
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Help', item: absoluteUrl('/help') },
      ],
    },
  ],
};

export default function HelpPage() {
  return (
    <MarketingPage>
      <JsonLdScript data={jsonLd} />
      <main>
        <PageHero eyebrow="Install guide" title="Download, open, and dictate from any Windows app">
          <p>
            Inumaki is a tray-first Windows voice-to-text app. It transcribes locally with
            whisper.cpp, so dictation can work without external transcription or an account.
          </p>
        </PageHero>

        <ContentBand>
          <div className="grid gap-4 sm:grid-cols-2">
            {installSteps.map((step, index) => (
              <InfoCard key={step.title}>
                <p
                  className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7fdcff]"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Step {index + 1}
                </p>
                <h2 className="mt-4 text-xl font-semibold text-white">{step.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{step.body}</p>
              </InfoCard>
            ))}
          </div>
        </ContentBand>

        <ContentBand>
          <InfoCard>
            <h2
              className="text-2xl font-semibold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Before you download
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              {PROCESSING_DISCLOSURE} The installer is currently unsigned, so Windows may show a
              SmartScreen prompt for an unrecognized publisher.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={INUMAKI_DOWNLOAD_URL}
                className="inline-flex min-h-[44px] items-center rounded-full bg-[#00aeef] px-6 text-sm font-semibold text-[#04131c] transition-colors hover:bg-[#42caff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14]"
              >
                Download latest Windows build
              </a>
              <a
                href={INUMAKI_RELEASES_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 bg-white/5 px-6 text-sm font-medium text-slate-100 transition-colors hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14]"
              >
                Browse releases
              </a>
            </div>
          </InfoCard>
        </ContentBand>

        <ContentBand>
          <h2
            className="text-2xl font-semibold text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Troubleshooting
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {troubleshooting.map((item) => (
              <InfoCard key={item.title}>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.body}</p>
              </InfoCard>
            ))}
          </div>
        </ContentBand>
      </main>
    </MarketingPage>
  );
}

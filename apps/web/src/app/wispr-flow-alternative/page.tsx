import type { Metadata } from 'next';
import {
  ContentBand,
  InfoCard,
  JsonLdScript,
  MarketingPage,
  PageHero,
} from '../_components/marketing-page';
import { INUMAKI_DOWNLOAD_URL, INUMAKI_REPO_URL } from '@/lib/github-release';
import { absoluteUrl, pageMetadata } from '@/lib/marketing';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Wispr Flow Alternative for Windows',
  description:
    'Compare Inumaki with Wispr Flow: a free, open-source, local Windows voice-to-text app with offline whisper.cpp transcription.',
  path: '/wispr-flow-alternative',
  keywords: [
    'Wispr Flow alternative',
    'free Wispr Flow alternative',
    'open source Wispr Flow alternative',
    'Windows voice to text alternative',
  ],
});

const rows = [
  {
    feature: 'Price',
    inumaki: 'Free, MIT-licensed, open source.',
    wispr: 'Basic is free with weekly limits; Pro is a paid plan.',
  },
  {
    feature: 'Source code',
    inumaki: 'Desktop client and backend code are public on GitHub.',
    wispr: 'Closed-source commercial product.',
  },
  {
    feature: 'Platforms',
    inumaki: 'Windows 10 and 11 today.',
    wispr: 'Mac, Windows, iPhone, and Android.',
  },
  {
    feature: 'Languages',
    inumaki: 'English-focused in the current release.',
    wispr: 'Advertises support for 100+ languages.',
  },
  {
    feature: 'Processing',
    inumaki: 'Local whisper.cpp transcription on your Windows PC.',
    wispr: 'Cloud transcription with Privacy Mode and security controls.',
  },
  {
    feature: 'Best fit',
    inumaki: 'Users who want free, offline, auditable Windows dictation.',
    wispr: 'Users who need polished cross-device sync, many languages, and enterprise controls.',
  },
];

const faq = [
  {
    question: 'Is Inumaki a local Wispr Flow alternative?',
    answer:
      'Yes. Inumaki is a free, open-source Windows alternative that transcribes locally with whisper.cpp instead of uploading microphone audio for transcription.',
  },
  {
    question: 'Why choose Inumaki over Wispr Flow?',
    answer:
      'Choose Inumaki if free pricing, MIT licensing, offline use, source-code transparency, and a focused Windows workflow matter more than cross-platform sync and mature commercial features.',
  },
  {
    question: 'Why choose Wispr Flow instead?',
    answer:
      'Choose Wispr Flow if you need Mac, iPhone, Android, 100+ languages, team features, or enterprise compliance controls today.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/wispr-flow-alternative#webpage`,
      url: absoluteUrl('/wispr-flow-alternative'),
      name: 'Wispr Flow Alternative for Windows',
      description: metadata.description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Wispr Flow Alternative',
          item: absoluteUrl('/wispr-flow-alternative'),
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
  ],
};

export default function WisprFlowAlternativePage() {
  return (
    <MarketingPage>
      <JsonLdScript data={jsonLd} />
      <main>
        <PageHero eyebrow="Comparison" title="A free open-source Wispr Flow alternative for Windows">
          <p>
            Inumaki is the local-first Windows lane: no subscription, no account, no cloud
            transcription, and source code you can inspect. Wispr Flow is broader and more polished;
            Inumaki is smaller, free, and private by design.
          </p>
        </PageHero>

        <ContentBand>
          <div className="overflow-hidden rounded-[1.5rem] border border-white/[0.07] bg-white/[0.025]">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Inumaki versus Wispr Flow feature comparison</caption>
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th
                    scope="col"
                    className="px-4 py-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-400 sm:px-6"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    Feature
                  </th>
                  <th scope="col" className="px-4 py-4 font-semibold text-[#7fdcff] sm:px-6">
                    Inumaki
                  </th>
                  <th scope="col" className="px-4 py-4 font-semibold text-slate-300 sm:px-6">
                    Wispr Flow
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-b border-white/[0.05] last:border-0 even:bg-white/[0.015]"
                  >
                    <th scope="row" className="px-4 py-4 align-top font-medium text-white sm:px-6">
                      {row.feature}
                    </th>
                    <td className="px-4 py-4 align-top text-slate-300 sm:px-6">{row.inumaki}</td>
                    <td className="px-4 py-4 align-top text-slate-400 sm:px-6">{row.wispr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Wispr Flow product details are summarized from its public pricing, platform, language,
            and privacy pages. Inumaki is not affiliated with or endorsed by Wispr Flow.
          </p>
        </ContentBand>

        <ContentBand>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard>
              <h2
                className="text-2xl font-semibold text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Pick Inumaki when
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-slate-300">
                <li>You want a free Windows voice-to-text tool.</li>
                <li>You want to inspect or fork the source code.</li>
                <li>You prefer a focused tray app over a full cross-platform suite.</li>
                <li>You want your microphone audio transcribed locally.</li>
              </ul>
            </InfoCard>
            <InfoCard>
              <h2
                className="text-2xl font-semibold text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Pick Wispr Flow when
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-slate-300">
                <li>You need Mac, iPhone, Android, and Windows support.</li>
                <li>You need 100+ languages today.</li>
                <li>You need enterprise compliance controls or team administration.</li>
                <li>You want a polished commercial product with more automation features.</li>
              </ul>
            </InfoCard>
          </div>
        </ContentBand>

        <ContentBand>
          <InfoCard>
            <h2
              className="text-2xl font-semibold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Sources and next steps
            </h2>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={INUMAKI_DOWNLOAD_URL}
                className="inline-flex min-h-[44px] items-center rounded-full bg-[#00aeef] px-6 text-sm font-semibold text-[#04131c] transition-colors hover:bg-[#42caff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14]"
              >
                Download Inumaki
              </a>
              <a
                href={INUMAKI_REPO_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 bg-white/5 px-6 text-sm font-medium text-slate-100 transition-colors hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14]"
              >
                View Inumaki source
              </a>
              <a
                href="https://wisprflow.ai/pricing"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 bg-white/5 px-6 text-sm font-medium text-slate-100 transition-colors hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14]"
              >
                Wispr pricing
              </a>
              <a
                href="https://wisprflow.ai/privacy"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-[44px] items-center rounded-full border border-white/15 bg-white/5 px-6 text-sm font-medium text-slate-100 transition-colors hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14]"
              >
                Wispr privacy
              </a>
            </div>
          </InfoCard>
        </ContentBand>
      </main>
    </MarketingPage>
  );
}

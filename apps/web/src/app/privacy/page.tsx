import type { Metadata } from 'next';
import {
  ContentBand,
  InfoCard,
  JsonLdScript,
  MarketingPage,
  PageHero,
} from '../_components/marketing-page';
import { INUMAKI_REPO_URL } from '@/lib/github-release';
import { absoluteUrl, pageMetadata, PROCESSING_DISCLOSURE } from '@/lib/marketing';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy and Local Audio Processing',
  description:
    'How Inumaki handles microphone audio locally with whisper.cpp, keeps transcription offline, and avoids cloud accounts or API keys.',
  path: '/privacy',
  keywords: [
    'Inumaki privacy',
    'Inumaki audio processing',
    'voice to text privacy',
    'open source dictation privacy',
  ],
});

const pipeline = [
  {
    title: '1. Capture in the Windows app',
    body: 'The renderer records microphone audio with MediaRecorder after you press the global hotkey.',
  },
  {
    title: '2. Transcribe locally',
    body: 'The audio is processed on your machine with whisper.cpp instead of being uploaded to a transcription service.',
  },
  {
    title: '3. Prepare clean text',
    body: 'The local transcript is formatted into paste-ready text without requiring a cloud model or personal API key.',
  },
  {
    title: '4. Paste anywhere',
    body: 'The result is placed on your clipboard so it can land in the Windows app where you were working.',
  },
];

const storedData = [
  'Preferences such as default output mode, hotkey behavior, and auto-paste settings.',
  'Local app settings needed for the desktop workflow.',
  'No cloud account is required for transcription.',
  'Raw microphone audio is not uploaded for transcription.',
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/privacy#webpage`,
      url: absoluteUrl('/privacy'),
      name: 'Inumaki Privacy and Local Audio Processing',
      description: metadata.description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Privacy', item: absoluteUrl('/privacy') },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Does Inumaki audio leave the computer?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. Inumaki transcribes microphone audio locally with whisper.cpp instead of uploading it for transcription.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does Inumaki store raw audio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Inumaki does not need to store raw microphone audio for remote processing. The local workflow keeps transcription on the device.',
          },
        },
      ],
    },
  ],
};

export default function PrivacyPage() {
  return (
    <MarketingPage>
      <JsonLdScript data={jsonLd} />
      <main>
        <PageHero eyebrow="Privacy & processing" title="A plain-English map of the local audio path">
          <p>{PROCESSING_DISCLOSURE}</p>
        </PageHero>

        <ContentBand>
          <InfoCard>
            <h2
              className="text-2xl font-semibold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Current release: local transcription
            </h2>
            <p className="mt-4 leading-relaxed text-slate-300">
              Inumaki is a local-first desktop app. The privacy promise is simple: microphone audio
              is transcribed on your Windows PC with whisper.cpp, with no account or remote
              transcription service in the loop.
            </p>
          </InfoCard>
        </ContentBand>

        <ContentBand>
          <div className="grid gap-4 sm:grid-cols-2">
            {pipeline.map((step) => (
              <InfoCard key={step.title}>
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
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
              What the app stores
            </h2>
            <ul className="mt-5 grid gap-3 text-sm leading-relaxed text-slate-300 sm:grid-cols-2">
              {storedData.map((item) => (
                <li key={item} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-relaxed text-slate-400">
              This page describes the public local-first product surface. If you run a modified
              backend or fork, audit that deployment separately.
            </p>
          </InfoCard>
        </ContentBand>

        <ContentBand>
          <div className="rounded-[1.5rem] border border-[#00aeef]/25 bg-[#00aeef]/[0.06] p-6 text-center sm:p-8">
            <h2
              className="text-2xl font-semibold text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Audit the path yourself
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300">
              The recorder and transcription path are in the public repository so you can inspect
              how audio is captured, processed, and returned to the clipboard.
            </p>
            <a
              href={`${INUMAKI_REPO_URL}/tree/main/apps`}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-6 inline-flex min-h-[44px] items-center rounded-full border border-white/15 bg-white/5 px-6 text-sm font-medium text-slate-100 transition-colors hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14]"
            >
              View source on GitHub
            </a>
          </div>
        </ContentBand>
      </main>
    </MarketingPage>
  );
}

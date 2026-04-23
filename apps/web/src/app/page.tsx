// apps/web/src/app/page.tsx
import { auth } from '@/lib/auth';
import Link from 'next/link';

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 overflow-hidden font-[var(--font-display)] selection:bg-purple-500/30">
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b border-white/5 bg-white/5 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20">
                I
              </div>
              <span className="font-semibold text-lg tracking-tight">Inumaki AI</span>
            </div>
            <div>
              {session?.user ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-full bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-colors shadow-sm"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 rounded-full bg-white/10 text-white font-medium text-sm hover:bg-white/20 transition-colors border border-white/10 shadow-sm"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="max-w-6xl mx-auto px-6 pt-32 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            Voice-to-Code Platform v1.0
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-tight">
            Speak{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Code & Text
            </span>
            <br />
            Instantly.
          </h1>

          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed font-[var(--font-mono)]">
            Inumaki AI is your intelligent dictation assistant. Seamlessly transform your voice into
            unstructured text, perfectly formatted emails, or ready-to-run code snippets directly
            into your IDE.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={session?.user ? '/dashboard' : '/auth/signin'}
              className="px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:bg-neutral-200 transition-transform active:scale-95 flex items-center gap-2 group shadow-xl shadow-white/10"
            >
              Get Started Free
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
            <a
              href="#features"
              className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-medium text-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              Explore Features
            </a>
          </div>
        </main>

        {/* Features Grid */}
        <section id="features" className="max-w-6xl mx-auto px-6 py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent pointer-events-none" />

          <div className="text-center mb-16 relative z-10">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Adaptable Dictation Modes</h2>
            <p className="text-neutral-400 font-[var(--font-mono)]">
              Context-aware outputs tailored to your workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            {[
              {
                mode: 'RAW',
                title: 'Raw Transcription',
                desc: 'Unfiltered, exact transcription of what you say. Perfect for brainstorming or capturing raw thoughts instantly.',
                icon: '🎙️',
                color: 'from-orange-500/20 to-orange-500/5',
                border: 'border-orange-500/20',
              },
              {
                mode: 'CLEAN',
                title: 'Clean Text',
                desc: 'Automatically removes filler words (ums, ahs) and applies correct punctuation for neat, readable notes.',
                icon: '✨',
                color: 'from-blue-500/20 to-blue-500/5',
                border: 'border-blue-500/20',
              },
              {
                mode: 'POLISHED',
                title: 'Polished Output',
                desc: 'Restructures your sentences for professional tone and clarity. Ideal for emails and document drafting.',
                icon: '📝',
                color: 'from-emerald-500/20 to-emerald-500/5',
                border: 'border-emerald-500/20',
              },
              {
                mode: 'CODING_PROMPT',
                title: 'Coding Prompt',
                desc: 'Interprets your logic and produces precise snippets, pseudocode, or IDE-ready commands automatically.',
                icon: '💻',
                color: 'from-purple-500/20 to-purple-500/5',
                border: 'border-purple-500/20',
              },
            ].map((feature) => (
              <div
                key={feature.mode}
                className={`p-8 rounded-3xl bg-gradient-to-br ${feature.color} border ${feature.border} backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:bg-white/5 group`}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">
                  {feature.icon}
                </div>
                <div className="font-[var(--font-mono)] text-xs text-neutral-400 mb-3 border border-white/10 px-2 py-1 rounded inline-block bg-black/40">
                  MODE: {feature.mode}
                </div>
                <h3 className="text-2xl font-semibold mb-3 tracking-tight text-neutral-100">
                  {feature.title}
                </h3>
                <p className="text-neutral-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-neutral-950/50 py-12 text-center text-neutral-500 backdrop-blur-sm relative z-10">
          <p className="font-[var(--font-mono)] text-sm">
            © {new Date().getFullYear()} Inumaki AI. Speak code responsibly.
          </p>
        </footer>
      </div>
    </div>
  );
}

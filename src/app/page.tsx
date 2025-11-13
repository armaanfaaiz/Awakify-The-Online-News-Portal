import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isAuthed = !!session;
  return (
    <div className="min-h-dvh landing-bg text-[var(--foreground)]">
      <div className="sticky top-0 z-10 border-b border-white/10 bg-black/30 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/awakify-logo.svg" alt="Awakify" width={120} height={32} priority />
          </Link>
          <nav className="hidden gap-3 sm:flex items-center">
            {isAuthed ? (
              <Link href="/dashboard" className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-white/90 hover:border-white/30 hover:bg-white/10 transition">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-4 py-2 text-white/80 hover:text-white transition">Log in</Link>
                <Link href="/signup" className="relative overflow-hidden rounded-xl bg-fuchsia-600/80 hover:bg-fuchsia-600 px-4 py-2 font-medium transition">
                  <span className="absolute inset-0 blur-xl bg-fuchsia-500/40"></span>
                  <span className="relative">Get started</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <main className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <section>
            <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
              AI‑powered, ad‑free news
              <span className="block text-white/70 mt-3 text-xl md:text-2xl">Personalized summaries. Fact‑checked stories. Glowing dark UI.</span>
            </h1>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              {isAuthed ? (
                <Link href="/dashboard" className="relative w-full sm:w-auto group overflow-hidden rounded-xl bg-fuchsia-600/80 hover:bg-fuchsia-600 text-white px-7 py-3.5 font-medium transition focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60">
                  <span className="absolute inset-0 blur-2xl bg-fuchsia-500/40 group-hover:bg-fuchsia-400/50 transition"></span>
                  <span className="relative">Go to your dashboard</span>
                </Link>
              ) : (
                <>
                  <Link href="/signup" className="relative w-full sm:w-auto group overflow-hidden rounded-xl bg-fuchsia-600/80 hover:bg-fuchsia-600 text-white px-7 py-3.5 font-medium transition focus:outline-none focus:ring-2 focus:ring-fuchsia-400/60">
                    <span className="absolute inset-0 blur-2xl bg-fuchsia-500/40 group-hover:bg-fuchsia-400/50 transition"></span>
                    <span className="relative">Create your account</span>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-white/90 hover:border-white/30 hover:bg-white/10 transition">
                    I already have an account
                  </Link>
                </>
              )}
            </div>
            <p className="mt-6 text-white/60 max-w-xl">
              Stay informed without the noise. Awakify brings you focused coverage with succinct AI summaries and verified sources.
            </p>
          </section>

          <section>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0b0b2e] to-[#1b0035] p-8 backdrop-blur-xl shadow-2xl shadow-fuchsia-900/20">
              {/* Bulb overlay that does not reserve layout space */}
              <div className="pointer-events-none absolute top-4 right-6">
                <div className="relative translate-x-[140%] opacity-0 animate-[awakify-bulb_2.6s_ease-out_forwards]">
                  <div className="absolute -inset-6 rounded-full bg-yellow-400/60 blur-[30px]"></div>
                  <svg width="160" height="160" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative drop-shadow-[0_0_14px_rgba(255,230,0,0.28)]">
                    <circle cx="120" cy="92" r="56" fill="#FFE600"/>
                    <path d="M92 118c10-10 46-10 56 0" stroke="#1b1b1b" strokeWidth="10" strokeLinecap="round"/>
                    <rect x="100" y="136" width="40" height="32" rx="8" fill="#1b1b1b"/>
                    <path d="M120 20v22M64 44l16 16M176 44l-16 16M36 92h22M204 92h-22" stroke="#FFE600" strokeWidth="12" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              {/* Feature chips now start at top with no reserved spacer */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="rounded-2xl bg-white/10 p-4 border border-white/10 hover:border-fuchsia-400/30 transition shadow-[0_0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_24px_-6px_rgba(217,70,239,0.35)]">
                  <div className="text-white/70">Personalized</div>
                  <div className="mt-1 text-white font-medium">Your feed, your focus</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 border border-white/10 hover:border-fuchsia-400/30 transition shadow-[0_0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_24px_-6px_rgba(217,70,239,0.35)]">
                  <div className="text-white/70">Ad‑free</div>
                  <div className="mt-1 text-white font-medium">No trackers, no clutter</div>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 border border-white/10 hover:border-fuchsia-400/30 transition shadow-[0_0_0_0_rgba(0,0,0,0)] hover:shadow-[0_0_24px_-6px_rgba(217,70,239,0.35)]">
                  <div className="text-white/70">Verified</div>
                  <div className="mt-1 text-white font-medium">Fact‑checked sources</div>
                </div>
              </div>
              <div className="pointer-events-none absolute -inset-1 rounded-3xl blur-3xl bg-fuchsia-500/10"></div>
            </div>
          </section>
        </main>

        {/* Expanded features */}
        <section className="mt-16">
          <h2 className="text-2xl md:text-3xl font-semibold">Why Awakify</h2>
          <p className="text-white/60 mt-2 max-w-2xl">Fast, focused, and trustworthy. The news experience you actually want.</p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Personalized feed", desc: "Follow categories and sources you care about." },
              { title: "AI summaries", desc: "Grasp key points in seconds with concise bullets." },
              { title: "Verified sources", desc: "Credibility heuristics and fact-check helpers." },
              { title: "Ad‑free reading", desc: "No clutter, no tracking—just the story." },
              { title: "Clean dark UI", desc: "Comfortable contrast and subtle glow aesthetics." },
              { title: "Quick actions", desc: "Right‑click to summarize or fact‑check instantly." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-fuchsia-400/30 hover:shadow-[0_0_24px_-6px_rgba(217,70,239,0.35)]">
                <div className="text-white font-medium">{f.title}</div>
                <div className="text-white/70 text-sm mt-1">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Showcase */}
        <section className="mt-20">
          <h2 className="text-2xl md:text-3xl font-semibold">A visual peek</h2>
          <p className="text-white/60 mt-2 max-w-2xl">Clean reading experience with elegant glow. Here are a few UI snippets from the app.</p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <Image src="/window.svg" alt="Reader view" width={400} height={240} className="w-full h-auto opacity-90" />
              <div className="mt-4 text-white font-medium">Reader view</div>
              <div className="text-white/60 text-sm">Distraction‑free article layout</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <Image src="/globe.svg" alt="Global coverage" width={400} height={240} className="w-full h-auto opacity-90" />
              <div className="mt-4 text-white font-medium">Global coverage</div>
              <div className="text-white/60 text-sm">Stories from verified sources</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <Image src="/file.svg" alt="AI summaries" width={400} height={240} className="w-full h-auto opacity-90" />
              <div className="mt-4 text-white font-medium">AI summaries</div>
              <div className="text-white/60 text-sm">Key facts at a glance</div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-20">
          <h2 className="text-2xl md:text-3xl font-semibold">Frequently asked questions</h2>
          <div className="mt-6 space-y-4">
            <details className="group rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <summary className="cursor-pointer list-none select-none font-medium text-white flex items-center justify-between">
                Is Awakify really ad‑free?
                <span className="ml-4 text-white/50 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-white/70">Yes. No ads, no trackers. Just the news you choose.</p>
            </details>
            <details className="group rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <summary className="cursor-pointer list-none select-none font-medium text-white flex items-center justify-between">
                How are summaries generated?
                <span className="ml-4 text-white/50 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-white/70">AI summarizes articles and cross‑references sources for accuracy.</p>
            </details>
            <details className="group rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <summary className="cursor-pointer list-none select-none font-medium text-white flex items-center justify-between">
                Can I personalize my feed?
                <span className="ml-4 text-white/50 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-3 text-white/70">Absolutely. Follow topics and publishers to tailor your experience.</p>
            </details>
          </div>
        </section>
      </div>

      <footer className="border-t border-white/10 bg-black/30 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between text-sm text-white/60">
          <span>© {new Date().getFullYear()} Awakify</span>
          <div className="hidden sm:flex gap-4">
            <a href="/login" className="hover:text-white">Login</a>
            <a href="/signup" className="hover:text-white">Signup</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

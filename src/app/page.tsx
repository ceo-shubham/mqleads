import Link from "next/link";
import { Logo } from "@/components/Logo";
import {
  LandingInteractiveDemo,
  LeadCalculator,
  FaqAccordion,
} from "@/components/LandingClient";
import {
  BrandLinkedIn,
  BrandTwitter,
  BrandInstagram,
  BrandYouTube,
  BrandFacebook,
  BrandReddit,
  BrandGoogle,
  IconCheck,
  IconPulse,
  IconLeads,
  IconTarget,
  IconGlobe,
  IconCode,
  IconShield,
} from "@/components/icons";

const platforms = [
  { name: "LinkedIn", icon: BrandLinkedIn, color: "#0077b5" },
  { name: "X / Twitter", icon: BrandTwitter, color: "#0f1419" },
  { name: "Instagram", icon: BrandInstagram, color: "#e1306c" },
  { name: "YouTube", icon: BrandYouTube, color: "#ff0000" },
  { name: "Facebook", icon: BrandFacebook, color: "#1877f2" },
  { name: "Reddit", icon: BrandReddit, color: "#ff4500" },
  { name: "Search Console", icon: BrandGoogle, color: "#4285f4" },
];

const features = [
  {
    icon: IconPulse,
    title: "Real-time Referrer & Profile Attribution",
    desc: "One tiny script on your site automatically parses referrer URLs to identify the exact social profile, campaign UTM, and source account your visitor clicked from.",
    tag: "Attribution",
  },
  {
    icon: IconLeads,
    title: "Automated Intent Scoring Engine",
    desc: "Scores visitors in real time (+15 for social referral, +20 for campaign links, +5 per page, +10 for outbound clicks). Qualified prospects (score ≥25) surface straight to your pipeline.",
    tag: "Scoring",
  },
  {
    icon: IconTarget,
    title: "Competitor Footprint & Gap Radar",
    desc: "Type any competitor's domain. MQLeads analyzes their live web presence, checks which social channels they are leveraging, and highlights high-impact channels where you have a competitive gap.",
    tag: "Intelligence",
  },
  {
    icon: IconGlobe,
    title: "Google Search Query Sync",
    desc: "Connect your Search Console to view the exact search queries, keywords, impressions, and ranking positions bringing real potential buyers to your domain.",
    tag: "SEO Signals",
  },
  {
    icon: IconCode,
    title: "CRM Export & Developer API",
    desc: "Seamless one-click CSV export for your sales reps, plus the window.MQLeads.identify() JavaScript SDK to turn authenticated website users into named leads immediately.",
    tag: "Integration",
  },
  {
    icon: IconShield,
    title: "Privacy First & Zero Cookie Bloat",
    desc: "Engineered without cross-site tracker pixels or third-party ad networks. Fully compliant with GDPR, CCPA, and India's DPDP Act 2023 regulations.",
    tag: "Compliance",
  },
];

import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Company } from "@/lib/models";

export default async function Home() {
  const user = await getSessionUser();
  let companyName = "";
  if (user) {
    await dbConnect();
    const company = await Company.findOne({ userId: user._id }).lean();
    if (company) companyName = company.name;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 selection:bg-indigo-500/20">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="h-8 w-8" />
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900">MQLeads</span>
              <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 border border-indigo-100">
                PRO
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">
              How It Works
            </a>
            <a href="#roi-calculator" className="hover:text-indigo-600 transition-colors">
              ROI Calculator
            </a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white pl-1.5 pr-3 py-1 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:bg-slate-50 transition-all shadow-sm"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-[11px] font-bold text-white uppercase shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <span className="max-w-[110px] truncate text-slate-800 font-bold">{user.name.split(" ")[0]}</span>
                </Link>

                <Link
                  href="/dashboard"
                  className="btn-primary text-xs sm:text-sm font-bold px-3.5 py-1.5 flex items-center gap-1.5 shadow-sm"
                >
                  <span>Dashboard</span>
                  <span className="text-indigo-200">&rarr;</span>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-xs sm:text-sm font-semibold">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary text-xs sm:text-sm font-semibold">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="space-y-24 sm:space-y-32 pb-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 sm:pt-24 px-4 sm:px-6 lg:px-8">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-500/15 via-violet-500/10 to-transparent blur-3xl -z-10 pointer-events-none" />

          <div className="mx-auto max-w-5xl text-center space-y-6">
            {user ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/90 bg-emerald-50/90 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulseDot" />
                <span>
                  Active Session · Welcome back, <strong>{user.name.split(" ")[0]}</strong>
                  {companyName ? ` (${companyName})` : ""}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulseDot" />
                Visitor Intelligence · Social Referrer Attribution · Competitor Radar
              </div>
            )}

            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl leading-tight">
              Know who visits your website from{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                Social Media.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed">
              Connect your LinkedIn, X, Instagram, YouTube, Facebook &amp; domain. MQLeads
              reveals the exact profile handles and campaign UTMs behind anonymous visitors, scores their
              intent, and uncovers your competitors&apos; channel gaps.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {user ? (
                <Link
                  href="/dashboard"
                  className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
                >
                  <span>Go To Your Dashboard</span>
                  <span>&rarr;</span>
                </Link>
              ) : (
                <Link href="/register" className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base shadow-lg shadow-indigo-600/25">
                  Start Building Your Pipeline Free
                </Link>
              )}
              <a href="#demo" className="btn-secondary w-full sm:w-auto px-6 py-3.5 text-base">
                Explore Live Demo ↓
              </a>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <IconCheck className="h-4 w-4 text-emerald-600" /> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <IconCheck className="h-4 w-4 text-emerald-600" /> 2-minute setup
              </span>
              <span className="flex items-center gap-1.5">
                <IconCheck className="h-4 w-4 text-emerald-600" /> 100% real signals
              </span>
            </div>
          </div>

          {/* Interactive Live Demo Widget Mockup */}
          <div id="demo" className="mx-auto max-w-5xl mt-14 sm:mt-16">
            <LandingInteractiveDemo />
          </div>
        </section>

        {/* Supported Channels Logo Cloud */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Automated Attribution &amp; Monitoring For All Major Platforms
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {platforms.map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm hover:border-indigo-300 transition-colors"
              >
                <p.icon className="h-5 w-5" />
                <span className="text-xs font-semibold text-slate-700">{p.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Pillars Grid */}
        <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Turn Invisible Traffic into Real Revenue
            </h2>
            <p className="text-base text-slate-600">
              Everything your marketing and sales team needs to capture warm intent and out-maneuver competitors.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card-hover p-6 sm:p-8 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <span className="badge bg-slate-100 text-slate-600 border border-slate-200/60">
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="border-y border-slate-200/80 bg-white py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                How MQLeads Works in 3 Simple Steps
              </h2>
              <p className="text-base text-slate-600">
                Zero engineering headaches. Connect, paste snippet, and begin capturing warm leads.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Connect Your Channels",
                  desc: "Authorize your LinkedIn, X, Instagram, YouTube, Reddit and domain in our secure integrations hub.",
                },
                {
                  step: "02",
                  title: "Embed 1-Line Tracking Tag",
                  desc: "Add our tiny asynchronous snippet to your website or Google Tag Manager. Works instantly with all web frameworks.",
                },
                {
                  step: "03",
                  title: "Act on Live Intelligence",
                  desc: "Watch attributed leads, intent score alerts, and competitor channel gaps populate your real-time dashboard.",
                },
              ].map((s) => (
                <div key={s.step} className="rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6 sm:p-8 space-y-4">
                  <div className="text-3xl font-extrabold font-mono text-indigo-600">{s.step}</div>
                  <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive ROI Calculator */}
        <section id="roi-calculator" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <LeadCalculator />
        </section>

        {/* FAQ Accordion */}
        <section id="faq" className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-slate-600">
              Everything you need to know about visitor intelligence and platform attribution.
            </p>
          </div>
          <FaqAccordion />
        </section>

        {/* Bottom CTA Banner */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-indigo-200 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-8 sm:p-14 text-center text-white shadow-2xl space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Ready to see who is visiting your site?
            </h2>
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-indigo-100 leading-relaxed">
              Join growth teams and agencies using MQLeads to identify high-intent social visitors and close more deals.
            </p>
            <div className="pt-2">
              {user ? (
                <Link href="/dashboard" className="btn bg-white text-indigo-700 font-bold px-8 py-3.5 text-base hover:bg-indigo-50 shadow-lg">
                  Go To Your Dashboard →
                </Link>
              ) : (
                <Link href="/register" className="btn bg-white text-indigo-700 font-bold px-8 py-3.5 text-base hover:bg-indigo-50 shadow-lg">
                  Create Free Workspace Now →
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Logo className="h-7 w-7" />
            <span className="text-base font-bold text-slate-900">MQLeads</span>
            <span className="text-xs text-slate-400">© {new Date().getFullYear()} ZYANIX. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-indigo-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-indigo-600 transition-colors">
              Terms of Service
            </Link>
            <a href="mailto:support@zyanix.xyz" className="hover:text-indigo-600 transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";
import { Logo } from "@/components/Logo";

const features = [
  {
    title: "Know who visits from social media",
    desc: "Paste one script on your site. Every visit from LinkedIn, Instagram, X, Facebook, Reddit or Google is attributed — including the profile handle in the referrer and the exact pages they open.",
  },
  {
    title: "Track what visitors do",
    desc: "Landing page, pages visited, time on site, outbound clicks and campaign (UTM) data — for every anonymous visitor, in one timeline.",
  },
  {
    title: "See who wants your services",
    desc: "Visitors are scored automatically. Someone who lands from LinkedIn, reads 5 pages and opens your contact page surfaces to the top of your lead list.",
  },
  {
    title: "Know who is finding you",
    desc: "Google Search Console sync shows the queries people actually use to find you — so you can target the ones you are missing.",
  },
  {
    title: "Competitor comparison",
    desc: "Add a competitor by domain. MQLeads reads their real site, detects which platforms they are on, and shows the gap: what they do that you do not.",
  },
  {
    title: "Connect all 7 sources",
    desc: "Company LinkedIn, Instagram, X, YouTube, Facebook, Reddit and your own domain — plus Google Search Console from our side.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="text-lg font-bold tracking-tight">MQLeads</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost">
              Log in
            </Link>
            <Link href="/register" className="btn-primary">
              Get started free
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Lead generation · Visitor intelligence · Competitor analysis
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Know every visitor.{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Beat every competitor.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            MQLeads connects your company&apos;s LinkedIn, Instagram, X, YouTube, Facebook, Reddit
            and domain. It shows you who lands on your site from social media, what they look at,
            who is searching for your services — and what your competitors are doing that you
            aren&apos;t.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register" className="btn-primary px-6 py-3 text-base">
              Start building your pipeline
            </Link>
            <Link href="/login" className="btn-secondary px-6 py-3 text-base">
              Log in
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card p-6">
                <h3 className="text-base font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-slate-100 bg-slate-50 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
              How it works
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {[
                { step: "1", title: "Connect your sources", desc: "Link your company LinkedIn, Instagram, X, YouTube, Facebook, Reddit and domain in under 2 minutes." },
                { step: "2", title: "Paste one script", desc: "Add a single line of code to your website. MQLeads starts attributing every visit from social media and Google." },
                { step: "3", title: "Act on real signals", desc: "New leads, search intent, competitor gaps — all in one dashboard. No spreadsheets, no guesswork." },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                    {s.step}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Your leads are already visiting your site.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-600">
            They just arrived from LinkedIn — and you have no idea who they are or what they looked at.
            Fix that now.
          </p>
          <Link href="/register" className="btn-primary mt-8 px-8 py-3 text-base">
            Create your free account
          </Link>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} MQLeads
      </footer>
    </div>
  );
}

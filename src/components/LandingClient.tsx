"use client";

import { useState } from "react";
import Link from "next/link";
import { IconChevronDown, IconSparkles } from "./icons";

interface DemoVisitor {
  id: string;
  name: string;
  source: string;
  sourceHandle: string;
  referrer: string;
  landingPage: string;
  pagesViewed: number;
  duration: string;
  score: number;
  status: string;
  events: { title: string; time: string; type: string }[];
}

const DEMO_VISITORS: DemoVisitor[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    source: "linkedin",
    sourceHandle: "in/rahul-sharma-tech",
    referrer: "https://linkedin.com/in/rahul-sharma-tech",
    landingPage: "/solutions/enterprise-ai",
    pagesViewed: 6,
    duration: "4m 20s",
    score: 85,
    status: "Qualified",
    events: [
      { title: "Arrived from LinkedIn profile link", time: "10:14 AM", type: "attribution" },
      { title: "Viewed /solutions/enterprise-ai (2m 10s)", time: "10:14 AM", type: "pageview" },
      { title: "Navigated to /pricing page (1m 30s)", time: "10:16 AM", type: "pageview" },
      { title: "Clicked 'Schedule Demo' CTA button", time: "10:18 AM", type: "intent" },
    ],
  },
  {
    id: "2",
    name: "Sarah Jenkins",
    source: "twitter",
    sourceHandle: "@sarah_growth",
    referrer: "https://x.com/sarah_growth/status/1892",
    landingPage: "/blog/lead-generation-2026",
    pagesViewed: 4,
    duration: "3m 15s",
    score: 65,
    status: "New Lead",
    events: [
      { title: "Arrived from X / Twitter thread link", time: "09:42 AM", type: "attribution" },
      { title: "Read case study blog post (2m 45s)", time: "09:43 AM", type: "pageview" },
      { title: "Downloaded PDF Growth Playbook", time: "09:45 AM", type: "intent" },
    ],
  },
  {
    id: "3",
    name: "David Chen",
    source: "reddit",
    sourceHandle: "u/dchen_dev",
    referrer: "https://reddit.com/r/SaaS/comments/...",
    landingPage: "/integrations",
    pagesViewed: 5,
    duration: "5m 05s",
    score: 75,
    status: "Contacted",
    events: [
      { title: "Arrived from r/SaaS recommendation link", time: "08:15 AM", type: "attribution" },
      { title: "Inspected API & Webhook documentation", time: "08:16 AM", type: "pageview" },
      { title: "Clicked outbound GitHub repository link", time: "08:20 AM", type: "intent" },
    ],
  },
];

const FAQS = [
  {
    q: "How does MQLeads know which social profile or page a visitor came from?",
    a: "When a user clicks your link on LinkedIn, Instagram, X (Twitter), Facebook, Reddit, or YouTube, modern browsers pass the referrer URL header. MQLeads' intelligent parsing engine detects the exact platform, handles (e.g. linkedin.com/in/username), and campaign UTM tags automatically.",
  },
  {
    q: "Does this require any cookies or invasive tracking?",
    a: "No. MQLeads uses lightweight, privacy-respecting client storage (localStorage) only on your domain to attribute user sessions without cross-site tracking or third-party ad pixels. It is fully compliant with GDPR, CCPA, and DPDP Act 2023 regulations.",
  },
  {
    q: "How fast is installation?",
    a: "Under 2 minutes. Simply copy the single-line `<script>` tag from your Tracking dashboard and paste it into your site header or tag manager.",
  },
  {
    q: "How does Competitor Analysis work?",
    a: "Enter any competitor's domain. MQLeads crawls their live website, detects all social channel footprint links (LinkedIn, X, YouTube, Instagram, etc.), inspects meta SEO signals, and generates a real-time gap analysis showing channels where they are gaining attention that you haven't claimed yet.",
  },
  {
    q: "Can I export leads to our CRM?",
    a: "Yes! You can filter and export all leads with full attribution data, contact details, notes, and session logs to CSV in one click, or integrate with webhooks.",
  },
];

export function LandingInteractiveDemo() {
  const [selectedVisitor, setSelectedVisitor] = useState<DemoVisitor>(DEMO_VISITORS[0]);

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-slate-900 p-4 sm:p-6 text-white shadow-2xl ring-1 ring-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-2 text-xs font-mono text-slate-400">app.mqleads.com/dashboard/leads</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulseDot" />
            Live Visitor Stream Active
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-12">
        {/* Left: Visitor Picker Tabs */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
            Simulate Incoming Visitor
          </div>
          {DEMO_VISITORS.map((v) => {
            const isSelected = selectedVisitor.id === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVisitor(v)}
                className={`w-full text-left rounded-2xl p-3.5 transition-all flex items-center justify-between border ${
                  isSelected
                    ? "bg-indigo-600/20 border-indigo-500 text-white shadow-glow"
                    : "bg-slate-800/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-sm font-bold">
                    {v.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-white">{v.name}</div>
                    <div className="truncate text-xs text-slate-400 flex items-center gap-1">
                      <span>{v.sourceHandle}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-emerald-400">Score: {v.score}</div>
                  <div className="text-[10px] text-slate-400">{v.duration}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Live Lead Profile Card */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white">{selectedVisitor.name}</h4>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                  {selectedVisitor.status}
                </span>
              </div>
              <p className="text-xs text-indigo-400 mt-0.5">{selectedVisitor.referrer}</p>
            </div>
            <div className="rounded-xl bg-indigo-500/10 px-3 py-1.5 text-center border border-indigo-500/20">
              <div className="text-[10px] uppercase font-bold text-indigo-300">Intent Score</div>
              <div className="text-xl font-bold font-mono text-white">{selectedVisitor.score}/100</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-900/80 p-3 text-center border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Pages Read</div>
              <div className="text-sm font-bold text-white mt-0.5">{selectedVisitor.pagesViewed} pages</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Time on Site</div>
              <div className="text-sm font-bold text-white mt-0.5">{selectedVisitor.duration}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Landing Page</div>
              <div className="text-sm font-bold text-white mt-0.5 truncate">{selectedVisitor.landingPage}</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Visitor Journey Timeline
            </div>
            <div className="space-y-2 border-l-2 border-indigo-500/30 pl-3 ml-1.5">
              {selectedVisitor.events.map((ev, i) => (
                <div key={i} className="relative text-xs">
                  <span className="absolute -left-[19px] top-1 h-2 w-2 rounded-full bg-indigo-400 ring-4 ring-slate-950" />
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="font-medium">{ev.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{ev.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LeadCalculator() {
  const [visitors, setVisitors] = useState(5000);
  const [contractValue, setContractValue] = useState(1200);

  // Estimations: ~3.5% social referral traffic * ~2.8% high-intent lead identification
  const estimatedLeads = Math.max(1, Math.round((visitors * 0.038 * 0.45)));
  const recoveredPipeline = estimatedLeads * contractValue;

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-indigo-900 to-slate-900 p-6 sm:p-10 text-white shadow-2xl">
      <div className="grid gap-8 lg:grid-cols-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3.5 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
            <IconSparkles className="h-3.5 w-3.5" />
            Interactive ROI Forecaster
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            How many hidden leads are visiting your site every month?
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Over 95% of social media visitors leave without filling a static contact form. MQLeads uncovers their profile handles and intent score so you can reach out before they choose a competitor.
          </p>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span>Monthly Website Visitors</span>
                <span className="font-mono text-indigo-300">{visitors.toLocaleString()} visitors</span>
              </div>
              <input
                type="range"
                min={1000}
                max={100000}
                step={1000}
                value={visitors}
                onChange={(e) => setVisitors(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-semibold mb-2">
                <span>Average Customer Contract / Deal Value</span>
                <span className="font-mono text-indigo-300">${contractValue.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={100}
                max={10000}
                step={100}
                value={contractValue}
                onChange={(e) => setContractValue(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md text-center space-y-5">
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Recovered High-Intent Leads
            </div>
            <div className="text-4xl font-extrabold font-mono text-emerald-400 mt-1">
              +{estimatedLeads} <span className="text-base font-normal text-slate-300">leads/mo</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <div className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Estimated Monthly Pipeline Opportunity
            </div>
            <div className="text-3xl font-extrabold font-mono text-white mt-1">
              ${recoveredPipeline.toLocaleString()}
            </div>
          </div>

          <Link href="/register" className="btn-primary w-full py-3 text-base shadow-lg shadow-indigo-500/25">
            Capture These Leads Free →
          </Link>
        </div>
      </div>
    </div>
  );
}

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {FAQS.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 bg-white transition-all overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between p-5 text-left font-semibold text-slate-900 hover:text-indigo-600"
            >
              <span>{faq.q}</span>
              <IconChevronDown
                className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-indigo-600" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

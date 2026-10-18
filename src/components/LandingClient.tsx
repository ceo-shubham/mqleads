"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconChevronDown,
  IconSparkles,
  BrandLinkedIn,
  BrandTwitter,
  BrandReddit,
  BrandGoogle,
  IconExternalLink,
  IconSearch,
  IconDownload,
} from "./icons";

interface DemoVisitor {
  id: string;
  name: string;
  role: string;
  company: string;
  source: "linkedin" | "twitter" | "reddit" | "google";
  sourceHandle: string;
  referrer: string;
  landingPage: string;
  pagesViewed: number;
  duration: string;
  score: number;
  status: "Qualified Lead" | "High Intent" | "Evaluating Pricing" | "Meeting Booked";
  location: string;
  tags: string[];
  events: { title: string; time: string; path?: string; duration?: string }[];
}

const DEMO_VISITORS: DemoVisitor[] = [
  {
    id: "1",
    name: "Arjun Mehta",
    role: "VP of Engineering",
    company: "FinScale Payments",
    source: "linkedin",
    sourceHandle: "linkedin.com/in/arjun-finscale",
    referrer: "https://linkedin.com/in/arjun-finscale",
    landingPage: "/solutions/enterprise",
    pagesViewed: 7,
    duration: "5m 20s",
    score: 94,
    status: "Meeting Booked",
    location: "Bengaluru, India",
    tags: ["Enterprise Account", "High Intent", "Demo Requested"],
    events: [
      { title: "Arrived via LinkedIn post profile link", time: "2m ago", path: "in/arjun-finscale" },
      { title: "Reviewed /solutions/enterprise overview", time: "2m ago", duration: "1m 40s" },
      { title: "Deep-dived into /security & compliance docs", time: "1m ago", duration: "2m 10s" },
      { title: "Inspected /pricing volume tiers", time: "45s ago", duration: "50s" },
      { title: "Clicked 'Book Architecture Consultation'", time: "Just now" },
    ],
  },
  {
    id: "2",
    name: "Elena Rostova",
    role: "Head of Demand Gen",
    company: "MetricFlow SaaS",
    source: "twitter",
    sourceHandle: "x.com/elena_growth",
    referrer: "https://x.com/elena_growth/status/189204",
    landingPage: "/case-studies/b2b-lead-gen",
    pagesViewed: 5,
    duration: "4m 10s",
    score: 82,
    status: "Qualified Lead",
    location: "London, UK",
    tags: ["Marketing Team", "Campaign Referrer"],
    events: [
      { title: "Arrived via X / Twitter thread on B2B Attribution", time: "14m ago" },
      { title: "Read customer ROI case study", time: "13m ago", duration: "2m 30s" },
      { title: "Explored /features/social-attribution", time: "10m ago", duration: "1m 15s" },
      { title: "Copied sample tracking code snippet", time: "8m ago" },
    ],
  },
  {
    id: "3",
    name: "David Chen",
    role: "Founder & CTO",
    company: "KubeStack AI",
    source: "reddit",
    sourceHandle: "reddit.com/u/dchen_dev",
    referrer: "https://reddit.com/r/SaaS/comments/lead_tools",
    landingPage: "/integrations",
    pagesViewed: 4,
    duration: "3m 45s",
    score: 76,
    status: "High Intent",
    location: "San Francisco, USA",
    tags: ["Developer", "Webhook Evaluation"],
    events: [
      { title: "Arrived via r/SaaS recommendation thread", time: "32m ago" },
      { title: "Inspected webhook & REST API documentation", time: "30m ago", duration: "2m 10s" },
      { title: "Navigated to /dashboard/sources preview", time: "28m ago", duration: "1m 20s" },
      { title: "Clicked outbound GitHub repository link", time: "27m ago" },
    ],
  },
  {
    id: "4",
    name: "Marcus Vance",
    role: "Director of Marketing",
    company: "Apex Global Media",
    source: "google",
    sourceHandle: 'Query: "visitor social referrer tracking"',
    referrer: "https://google.com/search?q=visitor+social+tracking",
    landingPage: "/",
    pagesViewed: 6,
    duration: "6m 05s",
    score: 88,
    status: "Evaluating Pricing",
    location: "New York, USA",
    tags: ["High Volume Buyer", "Organic Search"],
    events: [
      { title: "Arrived from Google Organic Search", time: "48m ago" },
      { title: "Tested interactive ROI calculator on homepage", time: "46m ago" },
      { title: "Viewed /pricing comparison table", time: "43m ago", duration: "3m 10s" },
      { title: "Explored Competitor Radar documentation", time: "41m ago" },
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
  const [filter, setFilter] = useState<"all" | "high" | "social">("all");

  const filteredVisitors = DEMO_VISITORS.filter((v) => {
    if (filter === "high") return v.score >= 80;
    if (filter === "social") return ["linkedin", "twitter", "reddit"].includes(v.source);
    return true;
  });

  function getPlatformIcon(source: DemoVisitor["source"]) {
    switch (source) {
      case "linkedin":
        return <BrandLinkedIn className="h-4 w-4 text-[#0077b5]" />;
      case "twitter":
        return <BrandTwitter className="h-4 w-4 text-slate-800" />;
      case "reddit":
        return <BrandReddit className="h-4 w-4 text-[#ff4500]" />;
      case "google":
        return <BrandGoogle className="h-4 w-4" />;
    }
  }

  function getStatusBadge(status: DemoVisitor["status"]) {
    switch (status) {
      case "Meeting Booked":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Qualified Lead":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "High Intent":
        return "bg-violet-50 text-violet-700 border-violet-200";
      case "Evaluating Pricing":
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-200/60 overflow-hidden text-slate-900 transition-all text-left">
      {/* Browser Chrome Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-slate-300" />
            <span className="h-3 w-3 rounded-full bg-slate-300" />
            <span className="h-3 w-3 rounded-full bg-slate-300" />
          </div>
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-mono text-slate-600 shadow-xs">
            <span className="text-emerald-500 font-bold">🔒</span>
            <span>https://mqleads.zenstro.space/dashboard/leads</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulseDot" />
            Live Attribution Stream Active
          </span>
        </div>
      </div>

      {/* Sub-header Dashboard KPI Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 border-b border-slate-200/80 bg-slate-50/40 p-4 sm:px-6 text-xs">
        <div className="rounded-xl border border-slate-200/70 bg-white p-3">
          <div className="text-slate-500 font-medium">Identified Prospects</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900">1,428</span>
            <span className="text-[11px] font-semibold text-emerald-600">+18% today</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-white p-3">
          <div className="text-slate-500 font-medium">Average Intent Score</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900">84</span>
            <span className="text-[11px] text-slate-400">/ 100</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-white p-3">
          <div className="text-slate-500 font-medium">Top Acquisition Source</div>
          <div className="mt-1 flex items-center gap-1 font-bold text-slate-900">
            <BrandLinkedIn className="h-3.5 w-3.5 text-[#0077b5]" />
            <span>LinkedIn (62%)</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/70 bg-white p-3">
          <div className="text-slate-500 font-medium">Pipeline Value Added</div>
          <div className="mt-1 text-lg font-bold text-slate-900">₹4.8L / mo</div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 px-4 py-3 sm:px-6 bg-white">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              filter === "all"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Leads (4)
          </button>
          <button
            onClick={() => setFilter("high")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              filter === "high"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            High Intent (Score &ge; 80)
          </button>
          <button
            onClick={() => setFilter("social")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              filter === "social"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Social Referrals
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads..."
              className="rounded-lg border border-slate-200 bg-slate-50/60 pl-8 pr-2.5 py-1 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
              readOnly
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-xs">
            <IconDownload className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Lead List on Left, Inspector on Right */}
      <div className="grid lg:grid-cols-12 min-h-[460px]">
        {/* Left Column: List of Leads */}
        <div className="lg:col-span-5 border-r border-slate-200/80 divide-y divide-slate-100 bg-slate-50/20 overflow-y-auto max-h-[520px]">
          {filteredVisitors.map((v) => {
            const isSelected = selectedVisitor.id === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVisitor(v)}
                className={`w-full text-left p-4 transition-all flex items-start gap-3 border-l-4 ${
                  isSelected
                    ? "bg-indigo-50/60 border-l-indigo-600 shadow-xs"
                    : "border-l-transparent hover:bg-slate-50/80"
                }`}
              >
                <div className="relative mt-0.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700">
                    {v.name[0]}
                  </div>
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5 shadow-xs border border-slate-200">
                    {getPlatformIcon(v.source)}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-sm font-bold text-slate-900">{v.name}</span>
                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                      {v.score}/100
                    </span>
                  </div>
                  <div className="truncate text-xs text-slate-600 font-medium">
                    {v.role} · <span className="text-slate-900 font-semibold">{v.company}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[160px]">{v.sourceHandle}</span>
                    <span>{v.duration}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Detailed Lead Inspector */}
        <div className="lg:col-span-7 p-5 sm:p-7 space-y-5 bg-white">
          {/* Header Profile Info */}
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-slate-900">{selectedVisitor.name}</h4>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getStatusBadge(selectedVisitor.status)}`}>
                  {selectedVisitor.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {selectedVisitor.role} at <b className="text-slate-900">{selectedVisitor.company}</b> · {selectedVisitor.location}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-indigo-600 hover:underline">
                {getPlatformIcon(selectedVisitor.source)}
                <span className="font-mono">{selectedVisitor.referrer}</span>
                <IconExternalLink className="h-3 w-3" />
              </div>
            </div>

            <div className="rounded-2xl bg-indigo-50/80 border border-indigo-100 px-4 py-2.5 text-center shrink-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Buyer Intent</div>
              <div className="text-2xl font-extrabold font-mono text-indigo-900">{selectedVisitor.score}<span className="text-xs font-normal text-slate-400">/100</span></div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-center">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Pages Read</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">{selectedVisitor.pagesViewed} pages</div>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-center">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Session Time</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">{selectedVisitor.duration}</div>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-center">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Landing URL</div>
              <div className="text-base font-bold text-slate-900 mt-0.5 truncate">{selectedVisitor.landingPage}</div>
            </div>
          </div>

          {/* Intent Tag Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1">Signals:</span>
            {selectedVisitor.tags.map((tag) => (
              <span key={tag} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                {tag}
              </span>
            ))}
          </div>

          {/* Real-time Journey Stream Timeline */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
              <span>Visitor Journey Log</span>
              <span className="text-[11px] font-normal text-slate-400 font-mono">Real-time attribution</span>
            </div>
            <div className="space-y-3 border-l-2 border-indigo-100 pl-4 ml-2">
              {selectedVisitor.events.map((ev, i) => (
                <div key={i} className="relative text-xs">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-indigo-600 ring-2 ring-indigo-100" />
                  <div className="flex items-center justify-between text-slate-800">
                    <span className="font-semibold">{ev.title}</span>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">{ev.time}</span>
                  </div>
                  {ev.duration && (
                    <div className="text-[11px] text-slate-500 mt-0.5">Time spent: {ev.duration}</div>
                  )}
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

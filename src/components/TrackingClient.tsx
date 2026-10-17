"use client";

import { useState } from "react";
import { IconCopy, IconSparkles, IconPlay } from "./icons";
import { useToast } from "./Toast";
import { SourceBadge } from "./SourceBadge";

interface VisitorDocView {
  _id: string;
  visitorId: string;
  referrerSource?: string | null;
  referrerHandle?: string | null;
  landingPage?: string;
  pageViews: number;
  score: number;
  lastSeenAt: string;
  identity?: { name?: string; email?: string; handle?: string } | null;
}

export function TrackingClient({
  siteId,
  origin,
  initialVisitors,
}: {
  siteId: string;
  origin: string;
  initialVisitors: VisitorDocView[];
}) {
  const { showToast } = useToast();
  const [framework, setFramework] = useState<"html" | "next" | "gtm" | "wp">("html");
  const [visitors] = useState<VisitorDocView[]>(initialVisitors);
  const [simulating, setSimulating] = useState(false);

  const scriptTag = `<script defer data-cfasync="false" src="${origin}/mqleads.js" data-site-id="${siteId}"></script>`;
  const nextSnippet = `// in app/layout.tsx
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="${origin}/mqleads.js"
          data-site-id="${siteId}"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}`;

  const gtmSnippet = `<!-- Google Tag Manager Custom HTML Tag -->
<script defer data-cfasync="false" src="${origin}/mqleads.js" data-site-id="${siteId}"></script>`;

  const wpSnippet = `<!-- WordPress Header and Footer Scripts Plugin -->
<script defer data-cfasync="false" src="${origin}/mqleads.js" data-site-id="${siteId}"></script>`;

  const identifySnippet = `// Identify authenticated visitors on your website:
if (window.MQLeads) {
  window.MQLeads.identify({
    name: "Alex Morgan",
    email: "alex@acme.com",
    handle: "alex_m",
    via: "login"
  });
}`;

  function copyCode(text: string, label: string) {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard", `${label} snippet copied.`);
  }

  async function sendTestEvent(sourceType: "linkedin" | "twitter" | "direct") {
    setSimulating(true);
    try {
      const testVisitorId = "test_vis_" + Math.random().toString(36).substring(2, 8);
      const testPayload = {
        type: "pageview",
        siteId,
        visitorId: testVisitorId,
        referrer:
          sourceType === "linkedin"
            ? "https://www.linkedin.com/in/test-prospect-founder"
            : sourceType === "twitter"
            ? "https://x.com/tech_innovator/status/1900"
            : "",
        page: "/pricing",
        title: "Enterprise Pricing & Solutions",
        screen: "1920x1080",
        locale: "en-US",
        ts: Date.now(),
      };

      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testPayload),
      });

      if (res.ok) {
        showToast(
          "Test Event Sent! 🚀",
          `Simulated a visitor arriving from ${sourceType}. Check the stream below.`
        );
        // Refresh page data or append
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        throw new Error("Track endpoint error");
      }
    } catch {
      showToast("Simulation failed", "Could not send test event to /api/track", "error");
    } finally {
      setSimulating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Code Snippet Installer Tabs */}
      <div className="card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">1. Install Website Tracking Snippet</h3>
            <p className="text-xs text-slate-500">
              Select your web framework to copy the optimized installation tag.
            </p>
          </div>

          {/* Framework selector pills */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              onClick={() => setFramework("html")}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                framework === "html" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              HTML / Vanilla
            </button>
            <button
              onClick={() => setFramework("next")}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                framework === "next" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Next.js / React
            </button>
            <button
              onClick={() => setFramework("gtm")}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                framework === "gtm" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Google Tag Manager
            </button>
            <button
              onClick={() => setFramework("wp")}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                framework === "wp" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              WordPress
            </button>
          </div>
        </div>

        <div className="relative rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto shadow-inner border border-slate-800">
          <button
            onClick={() =>
              copyCode(
                framework === "html"
                  ? scriptTag
                  : framework === "next"
                  ? nextSnippet
                  : framework === "gtm"
                  ? gtmSnippet
                  : wpSnippet,
                "Tracking tag"
              )
            }
            className="absolute top-3 right-3 rounded-lg bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            title="Copy snippet"
          >
            <IconCopy className="h-4 w-4" />
          </button>
          <pre className="pr-10 leading-relaxed">
            {framework === "html"
              ? scriptTag
              : framework === "next"
              ? nextSnippet
              : framework === "gtm"
              ? gtmSnippet
              : wpSnippet}
          </pre>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>
            Lightweight &lt;3KB bundle · Asynchronous loading · Cloudflare Rocket Loader compatible (
            <code className="text-indigo-600">data-cfasync=&quot;false&quot;</code>)
          </span>
        </div>
      </div>

      {/* Live Test Event Simulator Box */}
      <div className="card p-6 border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-violet-50/50 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700">
              <IconSparkles className="h-3.5 w-3.5" />
              Live Snippet &amp; Tracking Verification Tool
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">
              Simulate an incoming visitor touchpoint
            </h3>
            <p className="text-xs text-slate-500">
              Send an instant test ping to your site ID to verify attribution and intent scoring in real time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => sendTestEvent("linkedin")}
              disabled={simulating}
              className="btn-secondary text-xs"
            >
              <IconPlay className="h-3 w-3 text-sky-600" />
              Test LinkedIn Visitor
            </button>
            <button
              onClick={() => sendTestEvent("twitter")}
              disabled={simulating}
              className="btn-secondary text-xs"
            >
              <IconPlay className="h-3 w-3 text-slate-800" />
              Test X / Twitter Visitor
            </button>
          </div>
        </div>
      </div>

      {/* Identify API documentation */}
      <div className="card p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">2. Identify Authenticated Visitors (Optional SDK)</h3>
            <p className="text-xs text-slate-500">
              Call <code className="text-indigo-600 font-mono">window.MQLeads.identify()</code> when a user logs in on your website to turn them into a named lead.
            </p>
          </div>
          <button
            onClick={() => copyCode(identifySnippet, "Identify SDK code")}
            className="btn-secondary text-xs"
          >
            <IconCopy className="h-3.5 w-3.5" />
            Copy Code
          </button>
        </div>

        <pre className="rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800">
          {identifySnippet}
        </pre>
      </div>

      {/* Live Visitors Stream Table */}
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 p-5 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Captured Visitors Stream</h3>
            <span className="badge border border-emerald-200/80 bg-emerald-50 text-emerald-700 text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulseDot" />
              Live
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">{visitors.length} total records</span>
        </div>

        {visitors.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <p className="font-semibold text-slate-700 text-sm">No visitor events recorded yet</p>
            <p>Use the test simulator above or paste the tracking snippet on your live website.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30">
                  <th className="th">Visitor</th>
                  <th className="th">Attribution Source</th>
                  <th className="th">Referrer Profile Handle</th>
                  <th className="th">Landing Page</th>
                  <th className="th text-center">Pages</th>
                  <th className="th text-center">Score</th>
                  <th className="th text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visitors.map((v) => {
                  const name = v.identity?.name || v.identity?.handle || `Visitor ${v.visitorId.slice(0, 8)}`;
                  const isHot = v.score >= 25;

                  return (
                    <tr key={v._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="td font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200">
                            {name[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{name}</div>
                            {v.identity?.email && (
                              <div className="text-[10px] text-slate-400 font-mono">{v.identity.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="td">
                        <SourceBadge source={v.referrerSource} />
                      </td>
                      <td className="td text-xs font-mono text-slate-600">
                        {v.referrerHandle || "—"}
                      </td>
                      <td className="td max-w-[200px] truncate text-xs text-slate-500 font-mono">
                        {v.landingPage || "/"}
                      </td>
                      <td className="td text-center font-mono text-xs font-semibold text-slate-700">
                        {v.pageViews}
                      </td>
                      <td className="td text-center">
                        <span
                          className={`badge font-mono ${
                            isHot
                              ? "border border-emerald-200/80 bg-emerald-50 text-emerald-700 font-bold"
                              : "border border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {v.score} pts
                        </span>
                      </td>
                      <td className="td text-right whitespace-nowrap text-xs text-slate-400 font-mono">
                        {new Date(v.lastSeenAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

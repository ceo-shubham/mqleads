import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Company, SourceConnection, Visitor, Lead, SearchQuery, Competitor } from "@/lib/models";
import { SourceBadge } from "@/components/SourceBadge";
import { LeadRow } from "@/components/LeadRow";
import {
  IconPulse,
  IconLeads,
  IconTarget,
  IconLink,
  IconSparkles,
  IconTrendingUp,
  IconChevronRight,
} from "@/components/icons";

const DAY = 86400000;

import { autoProvisionWorkspace } from "@/lib/onboarding";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  await dbConnect();
  const company = await Company.findOne({ userId: user._id }).lean();
  if (!company) redirect("/register");

  // Zero-friction auto-provisioning: domain verification, competitor tracking, live leads, visitors
  await autoProvisionWorkspace(company._id, user.email);

  const since7 = new Date(Date.now() - 7 * DAY);
  const since30 = new Date(Date.now() - 30 * DAY);

  const sources = await SourceConnection.find({ companyId: company._id }).lean();
  const domainConn = sources.find((s) => s.provider === "domain");
  const siteIds = domainConn ? [domainConn._id] : [];

  const [visitors7, visitors30, leads7, leadsTotal, queries, competitorsCount, recentLeads, recentVisitors, socialCount] =
    await Promise.all([
      Visitor.countDocuments({ siteId: { $in: siteIds }, lastSeenAt: { $gte: since7 } }),
      Visitor.countDocuments({ siteId: { $in: siteIds }, lastSeenAt: { $gte: since30 } }),
      Lead.countDocuments({ companyId: company._id, createdAt: { $gte: since7 } }),
      Lead.countDocuments({ companyId: company._id }),
      SearchQuery.find({ companyId: company._id }).lean(),
      Competitor.countDocuments({ companyId: company._id }),
      Lead.find({ companyId: company._id }).sort({ score: -1, lastSeenAt: -1 }).limit(6).lean(),
      Visitor.find({ siteId: { $in: siteIds } }).sort({ lastSeenAt: -1 }).limit(8).lean(),
      Visitor.countDocuments({
        siteId: { $in: siteIds },
        lastSeenAt: { $gte: since7 },
        referrerSource: {
          $in: [
            "linkedin",
            "instagram",
            "twitter",
            "facebook",
            "reddit",
            "youtube",
            "tiktok",
            "pinterest",
            "whatsapp",
            "telegram",
          ],
        },
      }),
    ]);

  const connectedCount = sources.filter((s) => s.status === "connected").length;

  // Aggregate search queries by keyword
  const queryAgg: Record<string, { clicks: number; impressions: number; position: number }> = {};
  for (const q of queries) {
    const agg = (queryAgg[q.query] ||= { clicks: 0, impressions: 0, position: 0 });
    agg.clicks += q.clicks;
    agg.impressions += q.impressions;
    agg.position = agg.position === 0 ? q.position : Math.min(agg.position, q.position);
  }
  const topQueries = Object.entries(queryAgg)
    .map(([query, v]) => ({ query, ...v }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);

  const checklist = [
    { done: Boolean(domainConn), label: "Connect & verify your domain", href: "/dashboard/tracking" },
    { done: visitors30 > 0, label: "Install tracking snippet on your website", href: "/dashboard/tracking" },
    { done: connectedCount >= 1, label: "Link social media sources", href: "/dashboard/sources" },
    { done: competitorsCount >= 1, label: "Track a competitor domain", href: "/dashboard/competitors" },
    { done: queries.length > 0, label: "Sync Google Search Console", href: "/dashboard/sources" },
  ];

  const completedSteps = checklist.filter((c) => c.done).length;
  const progressPct = Math.round((completedSteps / checklist.length) * 100);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back, {user.name.split(" ")[0]}
            </h1>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulseDot" />
              Live Monitoring
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Real visitor intelligence &amp; competitor gap analysis for <span className="font-semibold text-slate-700">{company.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/leads" className="btn-secondary text-xs sm:text-sm">
            <IconLeads className="h-4 w-4 text-slate-500" />
            View Leads Pipeline
          </Link>
          <Link href="/dashboard/tracking" className="btn-primary text-xs sm:text-sm shadow-sm">
            <IconPulse className="h-4 w-4" />
            Tracking Hub
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <div className="card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Visitors (7d)</span>
            <IconPulse className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">{visitors7}</div>
          <div className="text-[11px] font-medium text-slate-400">
            {visitors30} past 30 days
          </div>
        </div>

        <div className="card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Social Referrals</span>
            <IconTrendingUp className="h-4 w-4 text-sky-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">{socialCount}</div>
          <div className="text-[11px] font-medium text-sky-600">
            {visitors7 > 0 ? `${Math.round((socialCount / visitors7) * 100)}% of traffic` : "Attributed"}
          </div>
        </div>

        <div className="card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">New Leads (7d)</span>
            <IconLeads className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">{leads7}</div>
          <div className="text-[11px] font-medium text-emerald-600">
            Score ≥ 25 threshold
          </div>
        </div>

        <div className="card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Leads</span>
            <IconSparkles className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">{leadsTotal}</div>
          <div className="text-[11px] font-medium text-slate-400">
            Active pipeline
          </div>
        </div>

        <div className="card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Sources Linked</span>
            <IconLink className="h-4 w-4 text-violet-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">{connectedCount}/7</div>
          <div className="text-[11px] font-medium text-violet-600">
            {7 - connectedCount} available
          </div>
        </div>

        <div className="card p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Competitors</span>
            <IconTarget className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">{competitorsCount}</div>
          <div className="text-[11px] font-medium text-slate-400">
            Under surveillance
          </div>
        </div>
      </div>

      {/* Main Grid: Leads & Sidebar Widgets */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: High-Intent Recent Leads */}
        <div className="card p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Qualified Leads</h2>
              <p className="text-xs text-slate-400">Visitors automatically scored based on engagement &amp; source.</p>
            </div>
            <Link
              href="/dashboard/leads"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1"
            >
              View Full Pipeline →
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <IconLeads className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">No leads captured yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Once the tracking snippet runs on your site, visitors who arrive from social channels or read multiple pages will appear here.
              </p>
              <div className="pt-2">
                <Link href="/dashboard/tracking" className="btn-primary text-xs">
                  Install Tracking Snippet
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentLeads.map((l) => (
                <LeadRow key={l._id.toString()} lead={l} />
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Onboarding Checklist & Search Console Queries */}
        <div className="space-y-6">
          {/* Quick Setup Checklist */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Workspace Setup</h3>
                <p className="text-xs text-slate-400">{completedSteps} of {checklist.length} completed</p>
              </div>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold font-mono text-indigo-700 border border-indigo-100">
                {progressPct}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <ol className="space-y-2.5 pt-1">
              {checklist.map((c) => (
                <li key={c.label}>
                  <Link
                    href={c.href}
                    className={`flex items-center justify-between rounded-xl p-2.5 text-xs transition-colors ${
                      c.done
                        ? "bg-slate-50 text-slate-500 hover:bg-slate-100/80"
                        : "border border-indigo-100 bg-indigo-50/50 text-indigo-950 font-semibold hover:bg-indigo-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          c.done
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-indigo-600 text-white"
                        }`}
                      >
                        {c.done ? "✓" : "→"}
                      </span>
                      <span className={c.done ? "line-through text-slate-400" : ""}>{c.label}</span>
                    </div>
                    <IconChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          {/* Search Console Keywords */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Organic Search Queries</h3>
                <p className="text-xs text-slate-400">Search keywords finding your site</p>
              </div>
              <Link href="/dashboard/sources" className="text-xs font-semibold text-indigo-600 hover:underline">
                Sync →
              </Link>
            </div>

            {topQueries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                Connect Google Search Console in Sources to mine search keyword impressions.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {topQueries.map((q) => (
                  <div key={q.query} className="flex items-center justify-between py-2 text-xs">
                    <span className="font-semibold text-slate-700 truncate max-w-[170px]" title={q.query}>
                      {q.query}
                    </span>
                    <div className="text-right text-[11px] text-slate-400 shrink-0 font-mono">
                      <span className="font-bold text-slate-700">{q.clicks}</span> clicks · pos {q.position.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Latest Live Visitors Stream */}
      <div className="card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-slate-900">Live Website Visitor Stream</h2>
            <span className="badge border border-emerald-200/70 bg-emerald-50 text-emerald-700 text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulseDot" />
              Real-time
            </span>
          </div>
          <Link href="/dashboard/tracking" className="text-xs font-bold text-indigo-600 hover:underline">
            Manage Tracking Script →
          </Link>
        </div>

        {recentVisitors.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700">No visitors recorded yet</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Once you place the tracking code on your website, incoming visits will be streamed live here with their social attribution source.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="th">Visitor</th>
                  <th className="th">Attribution Source</th>
                  <th className="th">Landing URL</th>
                  <th className="th text-center">Pages</th>
                  <th className="th text-center">Score</th>
                  <th className="th text-right">Last Touch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentVisitors.map((v) => {
                  const name = v.identity?.name || v.identity?.handle || `Visitor ${v.visitorId.slice(0, 8)}`;
                  const isHot = v.score >= 25;
                  return (
                    <tr key={v._id.toString()} className="hover:bg-slate-50/70 transition-colors">
                      <td className="td font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200">
                            {name[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-xs sm:text-sm">{name}</div>
                            {v.identity?.email && (
                              <div className="text-[11px] text-slate-400 font-mono">{v.identity.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="td">
                        <SourceBadge source={v.referrerSource} />
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
                        {v.lastSeenAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}{" "}
                        {v.lastSeenAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
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

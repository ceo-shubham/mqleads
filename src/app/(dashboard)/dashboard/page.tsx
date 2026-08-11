import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Company, SourceConnection, Visitor, Lead, SearchQuery, Competitor } from "@/lib/models";
import { SourceBadge } from "@/components/SourceBadge";
import { LeadRow } from "@/components/LeadRow";

const DAY = 86400000;

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  await dbConnect();
  const company = await Company.findOne({ userId: user._id }).lean();
  if (!company) redirect("/register");

  const since7 = new Date(Date.now() - 7 * DAY);
  const since30 = new Date(Date.now() - 30 * DAY);

  // Resolve sources + tracking sites once and reuse the ids — avoids 4+ extra
  // round trips to MongoDB on every dashboard load.
  const sources = await SourceConnection.find({ companyId: company._id }).lean();
  const domainConn = sources.find((s) => s.provider === "domain");
  const siteIds = domainConn ? [domainConn._id] : [];

  const [visitors7, visitors30, leads7, leadsTotal, queries, competitors, recentLeads, recentVisitors, socialCount] =
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
        referrerSource: { $in: ["linkedin", "instagram", "twitter", "facebook", "reddit", "youtube"] },
      }),
    ]);

  const connectedCount = sources.filter((s) => s.status === "connected").length;

  // Aggregate search queries by keyword.
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
    .slice(0, 6);

  const stats = [
    { label: "Visitors (7d)", value: visitors7 },
    { label: "From social (7d)", value: socialCount },
    { label: "New leads (7d)", value: leads7 },
    { label: "Total leads", value: leadsTotal },
    { label: "Sources connected", value: `${connectedCount}/7` },
    { label: "Competitors tracked", value: competitors },
  ];

  const checklist = [
    { done: connectedCount >= 1, label: "Connect your social sources", href: "/dashboard/sources" },
    { done: Boolean(domainConn), label: "Add & verify your domain", href: "/dashboard/tracking" },
    {
      done: visitors30 > 0,
      label: "Install the tracking snippet on your site",
      href: "/dashboard/tracking",
    },
    { done: queries.length > 0, label: "Sync Google Search Console", href: "/dashboard/sources" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {company.name} — real signals from your connected sources.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className="text-2xl font-bold text-slate-900">{s.value}</div>
            <div className="mt-1 text-xs font-medium text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent leads</h2>
            <Link href="/dashboard/leads" className="text-xs font-medium text-indigo-600 hover:underline">
              View all →
            </Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No leads yet. Install the tracking snippet or add a lead manually — real leads appear here.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentLeads.map((l) => (
                <LeadRow key={l._id.toString()} lead={l} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Get started</h2>
            <ol className="space-y-3">
              {checklist.map((c, i) => (
                <li key={c.label}>
                  <Link href={c.href} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        c.done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {c.done ? "✓" : i + 1}
                    </span>
                    <span className={`text-sm ${c.done ? "text-slate-400 line-through" : "text-slate-700"}`}>
                      {c.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Who is searching for you</h2>
            {topQueries.length === 0 ? (
              <p className="text-sm text-slate-400">
                Connect Google Search Console and sync to see the queries people use to find you.
              </p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {topQueries.map((q) => (
                    <tr key={q.query} className="border-b border-slate-50 last:border-0">
                      <td className="py-2 pr-2 text-slate-700">{q.query}</td>
                      <td className="py-2 text-right text-xs text-slate-400">
                        {q.impressions} imp · pos {q.position.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Latest visitors on your site</h2>
          <Link href="/dashboard/tracking" className="text-xs font-medium text-indigo-600 hover:underline">
            Tracking details →
          </Link>
        </div>
        {recentVisitors.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            No visits recorded yet. Once the snippet runs on your site, visitors show up here with their
            social attribution.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="th">Visitor</th>
                  <th className="th">Came from</th>
                  <th className="th">Landing page</th>
                  <th className="th">Pages</th>
                  <th className="th">Score</th>
                  <th className="th">Last seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentVisitors.map((v) => (
                  <tr key={v._id.toString()}>
                    <td className="td font-medium text-slate-900">
                      {v.identity?.name || v.identity?.handle || v.visitorId.slice(0, 8)}
                      {v.identity?.email && (
                        <span className="block text-xs font-normal text-slate-400">{v.identity.email}</span>
                      )}
                    </td>
                    <td className="td">
                      {v.referrerSource ? (
                        <SourceBadge source={v.referrerSource} />
                      ) : (
                        <span className="text-slate-400">direct</span>
                      )}
                    </td>
                    <td className="td max-w-[220px] truncate">{v.landingPage || "/"}</td>
                    <td className="td">{v.pageViews}</td>
                    <td className="td">
                      <span
                        className={`badge ${
                          v.score >= 25 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {v.score}
                      </span>
                    </td>
                    <td className="td whitespace-nowrap text-slate-400">
                      {v.lastSeenAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}{" "}
                      {v.lastSeenAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

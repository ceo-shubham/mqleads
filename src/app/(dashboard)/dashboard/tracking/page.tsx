import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Company, SourceConnection, Visitor } from "@/lib/models";
import { DomainCard } from "@/components/DomainCard";
import { CopyButton } from "@/components/CopyButton";
import { SourceBadge } from "@/components/SourceBadge";

export const metadata: Metadata = { title: "Tracking" };

function appOrigin(): string {
  const h = headers();
  const proto = h.get("x-forwarded-proto") || "http";
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}

export default async function TrackingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  await dbConnect();
  const company = await Company.findOne({ userId: user._id }).lean();
  if (!company) redirect("/register");

  const conn = await SourceConnection.findOne({ companyId: company._id, provider: "domain" }).lean();
  const origin = appOrigin();
  const snippet = conn
    ? `<script defer data-cfasync="false" src="${origin}/mqleads.js" data-site-id="${conn._id.toString()}"></script>`
    : "";

  const visitors = conn
    ? await Visitor.find({ siteId: conn._id }).sort({ lastSeenAt: -1 }).limit(15).lean()
    : [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tracking</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add your domain, then paste one script on your site. Every visit gets attributed to its social source.
        </p>
      </div>

      <DomainCard
        initial={
          conn
            ? {
                id: conn._id.toString(),
                domain: conn.domain,
                status: conn.status,
                verificationToken: conn.verificationToken,
                verifiedAt: conn.verifiedAt ? conn.verifiedAt.toISOString() : null,
                lastError: conn.lastError,
              }
            : null
        }
      />

      {conn && (
        <div className="card p-5">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">1. Paste this snippet</h2>
          <p className="mb-3 text-xs text-slate-500">
            Add it just before <code className="rounded bg-slate-100 px-1">&lt;/body&gt;</code> of every page you
            want to track (or in your tag-manager). If your site runs on Cloudflare, keep the{" "}
            <code className="rounded bg-slate-100 px-1">data-cfasync=&quot;false&quot;</code> attribute so Rocket Loader
            doesn&apos;t break it.
          </p>
          <div className="flex items-start gap-2">
            <pre className="min-w-0 flex-1 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-emerald-300">
              {snippet}
            </pre>
            <CopyButton text={snippet} />
          </div>
        </div>
      )}

      <div className="card p-5">
        <h2 className="mb-1 text-sm font-semibold text-slate-900">2. Optional: identify logged-in visitors</h2>
        <p className="mb-3 text-xs text-slate-500">
          When a visitor logs in on your site, call this with their profile to turn them into a known lead:
        </p>
        <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-emerald-300">{`window.MQLeads.identify({ name: "Rahul Sharma", email: "rahul@acme.com", handle: "rahul_sharma", via: "login" });`}</pre>
      </div>

      <div className="card p-5">
        <h2 className="mb-1 text-sm font-semibold text-slate-900">What gets captured</h2>
        <ul className="mt-2 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
          <li>• Referrer — which social platform (LinkedIn, Instagram, X, Facebook, Reddit, YouTube, Google…)</li>
          <li>• Profile handle from the referrer URL when present (e.g. linkedin.com/in/rahul-sharma)</li>
          <li>• UTM source / medium / campaign from your ad links</li>
          <li>• Every page visited + time spent</li>
          <li>• Outbound clicks (links to other sites)</li>
          <li>• Device, browser, OS, locale, timezone</li>
        </ul>
      </div>

      {conn && (
        <div className="card overflow-x-auto">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-slate-900">Recent visitors</h2>
          </div>
          {visitors.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">
              No visits yet. Once the snippet runs, every visitor appears here with their social attribution.
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="th">Visitor</th>
                  <th className="th">Came from</th>
                  <th className="th">Handle</th>
                  <th className="th">Landing page</th>
                  <th className="th">Pages</th>
                  <th className="th">Score</th>
                  <th className="th">Last seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visitors.map((v) => (
                  <tr key={v._id.toString()}>
                    <td className="td font-medium text-slate-900">
                      {v.identity?.name || v.identity?.handle || v.visitorId.slice(0, 8)}
                      {v.identity?.email && (
                        <span className="block text-xs font-normal text-slate-400">{v.identity.email}</span>
                      )}
                    </td>
                    <td className="td">
                      <SourceBadge source={v.referrerSource} />
                    </td>
                    <td className="td text-xs text-slate-500">{v.referrerHandle || "—"}</td>
                    <td className="td max-w-[200px] truncate">{v.landingPage || "/"}</td>
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
                    <td className="td whitespace-nowrap text-xs text-slate-400">
                      {v.lastSeenAt.toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Company, SourceConnection, Visitor } from "@/lib/models";
import { DomainCard } from "@/components/DomainCard";
import { TrackingClient } from "@/components/TrackingClient";

export const metadata: Metadata = { title: "Tracking Snippet & Setup" };

function appOrigin(): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.trim().replace(/\/$/, "");
  }
  const h = headers();
  const proto = h.get("x-forwarded-proto") || "http";
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  return `${proto}://${host}`;
}

import { autoProvisionWorkspace } from "@/lib/onboarding";

export default async function TrackingPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  await dbConnect();
  const company = await Company.findOne({ userId: user._id }).lean();
  if (!company) redirect("/register");

  await autoProvisionWorkspace(company._id, user.email);

  const conn = await SourceConnection.findOne({ companyId: company._id, provider: "domain" }).lean();
  const origin = appOrigin();

  const visitors = conn
    ? await Visitor.find({ siteId: conn._id }).sort({ lastSeenAt: -1 }).limit(25).lean()
    : [];

  const initialVisitors = visitors.map((v) => ({
    _id: v._id.toString(),
    visitorId: v.visitorId,
    referrerSource: v.referrerSource,
    referrerHandle: v.referrerHandle,
    landingPage: v.landingPage,
    pageViews: v.pageViews,
    score: v.score,
    lastSeenAt: v.lastSeenAt.toISOString(),
    identity: v.identity ? { ...v.identity } : null,
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Website Tracking</h1>
          <p className="mt-1 text-sm text-slate-500">
            Verify your domain, embed the tracking tag, and test attribution events live.
          </p>
        </div>
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
        <TrackingClient
          siteId={conn._id.toString()}
          origin={origin}
          initialVisitors={initialVisitors}
        />
      )}
    </div>
  );
}

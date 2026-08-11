import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Company, Lead, type VisitorEvent } from "@/lib/models";
import { LeadsClient, type LeadView } from "@/components/LeadsClient";

export const metadata: Metadata = { title: "Leads" };

export default async function LeadsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  await dbConnect();
  const company = await Company.findOne({ userId: user._id }).lean();
  if (!company) redirect("/register");

  const leads = await Lead.find({ companyId: company._id }).sort({ score: -1, lastSeenAt: -1 }).limit(200).lean();

  const views: LeadView[] = leads.map((l) => ({
    id: l._id.toString(),
    source: l.source,
    referrerSource: l.referrerSource,
    person: l.person ? { ...l.person } : null,
    landingPage: l.landingPage,
    referrerUrl: l.referrerUrl,
    utmSource: l.utmSource,
    pageViews: l.pageViews,
    timeOnSiteSec: l.timeOnSiteSec,
    score: l.score,
    status: l.status,
    note: l.note,
    firstSeenAt: l.firstSeenAt.toISOString(),
    lastSeenAt: l.lastSeenAt.toISOString(),
    events: ((l.events || []) as VisitorEvent[]).map((e) => ({ ...e })),
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leads</h1>
        <p className="mt-1 text-sm text-slate-500">
          Everyone who showed interest in your services — scored by intent. Click a row for the full visit timeline.
        </p>
      </div>
      <LeadsClient initialLeads={views} />
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Company, Lead, type VisitorEvent } from "@/lib/models";
import { LeadsClient, type LeadView } from "@/components/LeadsClient";

export const metadata: Metadata = { title: "Leads Pipeline" };

import { autoProvisionWorkspace } from "@/lib/onboarding";

export default async function LeadsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  await dbConnect();
  const company = await Company.findOne({ userId: user._id }).lean();
  if (!company) redirect("/register");

  await autoProvisionWorkspace(company._id, user.email);

  const leads = await Lead.find({ companyId: company._id }).sort({ score: -1, lastSeenAt: -1 }).limit(200).lean();

  const views: LeadView[] = leads.map((l) => ({
    id: l._id.toString(),
    source: l.source,
    referrerSource: l.referrerSource,
    person: l.person ? { ...l.person } : null,
    landingPage: l.landingPage,
    referrerUrl: l.referrerUrl,
    utmSource: l.utmSource,
    utmCampaign: l.utmCampaign,
    utmMedium: l.utmMedium,
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
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Leads Pipeline</h1>
          <p className="mt-1 text-sm text-slate-500">
            Attributed prospects and high-intent website visitors ready for sales outreach.
          </p>
        </div>
      </div>
      <LeadsClient initialLeads={views} />
    </div>
  );
}

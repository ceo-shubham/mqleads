import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Company, SourceConnection, Competitor } from "@/lib/models";
import { SOCIAL_PROVIDERS } from "@/lib/providers";
import { CompetitorsClient, type CompetitorView } from "@/components/CompetitorsClient";

export const metadata: Metadata = { title: "Competitors" };

export default async function CompetitorsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  await dbConnect();
  const company = await Company.findOne({ userId: user._id }).lean();
  if (!company) redirect("/register");

  const [competitors, sources] = await Promise.all([
    Competitor.find({ companyId: company._id }).sort({ createdAt: -1 }).lean(),
    SourceConnection.find({ companyId: company._id, provider: { $in: SOCIAL_PROVIDERS }, status: "connected" })
      .select("provider")
      .lean(),
  ]);

  const myPlatforms = sources.map((s) => s.provider);

  const views: CompetitorView[] = competitors.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    domain: c.domain,
    website: c.website,
    meta: c.meta
      ? {
          title: c.meta.title,
          description: c.meta.description,
          logo: c.meta.logo,
          socials: c.meta.socials
            ? c.meta.socials instanceof Map
              ? Object.fromEntries(c.meta.socials)
              : c.meta.socials
            : undefined,
        }
      : null,
    platformsDetected: c.platformsDetected || [],
    lastFetchedAt: c.lastFetchedAt ? c.lastFetchedAt.toISOString() : null,
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Competitors</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add a competitor and MQLeads reads their real website: what they do, which platforms they use, and
          where you are missing out.
        </p>
      </div>
      <CompetitorsClient initialCompetitors={views} myPlatforms={myPlatforms} />
    </div>
  );
}

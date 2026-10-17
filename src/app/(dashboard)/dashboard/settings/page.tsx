import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Company } from "@/lib/models";
import { SettingsClient, type CompanyView } from "@/components/SettingsClient";

export const metadata: Metadata = { title: "Company Profile & Settings" };

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  await dbConnect();
  const company = await Company.findOne({ userId: user._id }).lean();
  if (!company) redirect("/register");

  const view: CompanyView = {
    id: company._id.toString(),
    name: company.name,
    legalName: company.legalName,
    tagline: company.tagline,
    description: company.description,
    industry: company.industry,
    website: company.website,
    logoUrl: company.logoUrl,
    email: company.email,
    phone: company.phone,
    address: company.address,
    city: company.city,
    country: company.country,
    socials: company.socials ? { ...company.socials } : null,
    autofillMeta: company.autofillMeta
      ? { source: company.autofillMeta.source, filledAt: company.autofillMeta.filledAt.toISOString() }
      : null,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Company Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your organization profile, brand assets, and social channels.
          </p>
        </div>
      </div>
      <SettingsClient initialCompany={view} />
    </div>
  );
}

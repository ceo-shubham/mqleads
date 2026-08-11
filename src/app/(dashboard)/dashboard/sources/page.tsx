import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Company, SourceConnection } from "@/lib/models";
import { OAUTH_PROVIDERS, SOCIAL_PROVIDERS } from "@/lib/providers";
import { SourcesClient, type ProviderMeta, type SourceConnView } from "@/components/SourcesClient";

export const metadata: Metadata = { title: "Sources" };

export default async function SourcesPage({
  searchParams,
}: {
  searchParams: { connected?: string; error?: string; message?: string; provider?: string; missing?: string };
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  await dbConnect();
  const company = await Company.findOne({ userId: user._id }).lean();
  if (!company) redirect("/register");

  const connections = await SourceConnection.find({ companyId: company._id }).lean();

  const view = (c: (typeof connections)[number]): SourceConnView => ({
    provider: c.provider,
    status: c.status,
    accountName: c.accountName,
    accountUrl: c.accountUrl,
    domain: c.domain,
    verificationToken: c.verificationToken,
    verifiedAt: c.verifiedAt ? c.verifiedAt.toISOString() : null,
    lastError: c.lastError,
    lastSyncedAt: c.lastSyncedAt ? c.lastSyncedAt.toISOString() : null,
  });

  const providers: ProviderMeta[] = SOCIAL_PROVIDERS.map((id) => {
    const p = OAUTH_PROVIDERS[id];
    return {
      id,
      label: p.label,
      description: p.description,
      color: p.color,
      configured: p.isConfigured(),
      missing: p.missingEnv(),
      isOAuth: true,
    };
  });

  const searchConsoleConn = connections.find((c) => c.provider === "search-console");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sources</h1>
        <p className="mt-1 text-sm text-slate-500">
          Connect your company&apos;s channels. Everything is stored encrypted and read-only.
        </p>
      </div>

      {searchParams.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <b>Connection failed:</b>{" "}
          {searchParams.error === "not-configured"
            ? `Missing keys (${searchParams.missing || "see .env"}) for ${searchParams.provider}.`
            : searchParams.message || "Something went wrong. Please try again."}
        </div>
      )}
      {searchParams.connected && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          🎉 {searchParams.connected === "search-console" ? "Google Search Console" : "Source"} connected
          successfully. It will appear in your dashboard.
        </div>
      )}

      <SourcesClient
        providers={providers}
        connections={connections.map(view)}
        searchConsole={searchConsoleConn ? view(searchConsoleConn) : null}
      />

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-900">About the connections</h3>
        <ul className="mt-3 space-y-2 text-xs text-slate-500">
          <li>• Access tokens are encrypted at rest with your APP_SECRET and never exposed to the browser.</li>
          <li>• Scopes are read-only where the platform allows (e.g. YouTube: youtube.readonly).</li>
          <li>• Google Search Console is provisioned by the MQLeads team — connect with the same Google account that owns your Search Console property.</li>
          <li>
            • LinkedIn company-page data needs extra scopes (
            <code className="rounded bg-slate-100 px-1">r_organization_social</code>) which require LinkedIn app
            approval — ask us to enable it for your app.
          </li>
        </ul>
      </div>
    </div>
  );
}

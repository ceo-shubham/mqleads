import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Company, SourceConnection } from "@/lib/models";
import { OAUTH_PROVIDERS, SOCIAL_PROVIDERS } from "@/lib/providers";
import { SourcesClient, type ProviderMeta, type SourceConnView } from "@/components/SourcesClient";
import { IconShield } from "@/components/icons";

export const metadata: Metadata = { title: "Connected Sources & Channels" };

import { autoProvisionWorkspace } from "@/lib/onboarding";

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

  await autoProvisionWorkspace(company._id, user.email);

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
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Connected Sources</h1>
          <p className="mt-1 text-sm text-slate-500">
            Link your company channels for automated profile attribution and search keyword intelligence.
          </p>
        </div>
      </div>

      {searchParams.error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <b>Connection failed:</b>{" "}
          {searchParams.error === "not-configured"
            ? `Missing keys (${searchParams.missing || "see .env"}) for ${searchParams.provider}.`
            : searchParams.message || "Something went wrong. Please try again."}
        </div>
      )}
      {searchParams.connected && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          🎉 {searchParams.connected === "search-console" ? "Google Search Console" : "Source"} connected
          successfully. Signals are now live in your workspace.
        </div>
      )}

      <SourcesClient
        providers={providers}
        connections={connections.map(view)}
        searchConsole={searchConsoleConn ? view(searchConsoleConn) : null}
      />

      <div className="card p-6 border-slate-200 bg-slate-50/50 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <IconShield className="h-4 w-4 text-indigo-600" />
          <span>Enterprise Token Security &amp; Read-Only Privacy</span>
        </div>
        <ul className="grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
          <li>• OAuth access tokens are encrypted with AES-256-GCM at rest and never exposed to the client.</li>
          <li>• Requested scopes are strictly read-only wherever platforms permit.</li>
          <li>• Google Search Console sync uses the official webmasters API to read query impressions.</li>
          <li>• You can disconnect any source at any time with immediate token revocation.</li>
        </ul>
      </div>
    </div>
  );
}

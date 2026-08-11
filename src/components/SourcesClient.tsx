"use client";

import { useState } from "react";
import { DomainCard, type DomainConn } from "./DomainCard";

export interface SourceConnView {
  provider: string;
  status: string;
  accountName?: string;
  accountUrl?: string;
  domain?: string;
  verificationToken?: string;
  verifiedAt?: string | null;
  lastError?: string | null;
  lastSyncedAt?: string | null;
}

export interface ProviderMeta {
  id: string;
  label: string;
  description: string;
  color: string;
  configured: boolean;
  missing: string[];
  isOAuth: boolean;
}

export function SourcesClient({
  providers,
  connections,
  searchConsole,
}: {
  providers: ProviderMeta[];
  connections: SourceConnView[];
  searchConsole: SourceConnView | null;
}) {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ ok: boolean; text: string } | null>(null);

  const domainConn = connections.find((c) => c.provider === "domain") || null;
  const connFor = (id: string) => connections.find((c) => c.provider === id);

  async function disconnect(provider: string) {
    await fetch(`/api/sources/${provider}/disconnect`, { method: "DELETE" });
    window.location.reload();
  }

  async function syncSearchConsole() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/search-console/sync?days=28", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      const top = (data.topQueries || []).slice(0, 5) as { query: string; clicks: number }[];
      setSyncResult({
        ok: true,
        text: `Synced ${data.synced} queries (${data.period?.startDate} → ${data.period?.endDate}). Top: ${top
          .map((q) => `${q.query} (${q.clicks})`)
          .join(", ")}`,
      });
      window.location.reload();
    } catch (err) {
      setSyncResult({ ok: false, text: err instanceof Error ? err.message : "Sync failed" });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-6">
      {providers.map((p) => {
        const conn = connFor(p.id);
        const connected = conn?.status === "connected";
        return (
          <div key={p.id} className="card p-5">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ background: p.color }}
              >
                {p.label.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">{p.label}</h3>
                  {connected && <span className="badge bg-emerald-100 text-emerald-700">Connected</span>}
                  {conn && !connected && (
                    <span className="badge bg-amber-100 text-amber-700">{conn.status}</span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{p.description}</p>
              </div>
              <div className="shrink-0">
                {connected ? (
                  <div className="flex items-center gap-2">
                    {conn?.accountName && (
                      <span className="hidden max-w-[180px] truncate text-xs text-slate-500 sm:block">
                        {conn.accountUrl ? (
                          <a
                            href={conn.accountUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-indigo-600 hover:underline"
                          >
                            {conn.accountName}
                          </a>
                        ) : (
                          conn.accountName
                        )}
                      </span>
                    )}
                    <button className="btn-danger" onClick={() => disconnect(p.id)}>
                      Disconnect
                    </button>
                  </div>
                ) : p.isOAuth ? (
                  p.configured ? (
                    <a className="btn-primary" href={`/api/sources/${p.id}/connect`}>
                      Connect
                    </a>
                  ) : (
                    <span className="badge bg-slate-100 text-slate-500" title={p.missing.join(", ")}>
                      Keys missing
                    </span>
                  )
                ) : (
                  <span className="badge bg-slate-100 text-slate-500">On our side</span>
                )}
              </div>
            </div>
            {!connected && p.isOAuth && !p.configured && (
              <p className="mt-2 text-xs text-amber-600">
                Add{" "}
                {p.missing.map((m, i) => (
                  <span key={m}>
                    {i > 0 && <>, </>}
                    <code className="rounded bg-amber-50 px-1">{m}</code>
                  </span>
                ))}{" "}
                to <code className="rounded bg-amber-50 px-1">.env</code> to enable this connection.
              </p>
            )}
            {conn?.lastError && (
              <p className="mt-2 text-xs text-red-600">{conn.lastError}</p>
            )}
          </div>
        );
      })}

      {/* Domain — the 7th source */}
      <DomainCard initial={domainConn as DomainConn | null} />

      {/* Google Search Console — connected from our side */}
      <div className="card p-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ background: "#4285f4" }}
          >
            G
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Google Search Console</h3>
              {searchConsole?.status === "connected" && (
                <span className="badge bg-emerald-100 text-emerald-700">Connected</span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Managed by the MQLeads team. Shows which search queries bring people to your site.
            </p>
          </div>
          <div className="shrink-0">
            {searchConsole?.status === "connected" ? (
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-slate-500 sm:block">{searchConsole.accountName}</span>
                <button className="btn-secondary" onClick={syncSearchConsole} disabled={syncing}>
                  {syncing ? "Syncing…" : "Sync queries"}
                </button>
                <button className="btn-danger" onClick={() => disconnect("search-console")}>
                  Disconnect
                </button>
              </div>
            ) : (
              <a className="btn-primary" href="/api/sources/search-console/connect">
                Connect
              </a>
            )}
          </div>
        </div>
        {searchConsole?.lastSyncedAt && (
          <p className="mt-2 text-xs text-slate-400">Last synced {new Date(searchConsole.lastSyncedAt).toLocaleString()}</p>
        )}
        {searchConsole?.lastError && <p className="mt-2 text-xs text-red-600">{searchConsole.lastError}</p>}
        {syncResult && (
          <p className={`mt-2 text-xs ${syncResult.ok ? "text-emerald-600" : "text-red-600"}`}>{syncResult.text}</p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { DomainCard, type DomainConn } from "./DomainCard";
import {
  BrandLinkedIn,
  BrandTwitter,
  BrandInstagram,
  BrandYouTube,
  BrandFacebook,
  BrandReddit,
  BrandGoogle,
  IconExternalLink,
  IconRefresh,
  IconGlobe,
} from "./icons";
import { useToast } from "./Toast";

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

function getProviderIcon(id: string, className = "h-5 w-5") {
  switch (id) {
    case "linkedin":
      return <BrandLinkedIn className={className} />;
    case "twitter":
      return <BrandTwitter className={className} />;
    case "instagram":
      return <BrandInstagram className={className} />;
    case "youtube":
      return <BrandYouTube className={className} />;
    case "facebook":
      return <BrandFacebook className={className} />;
    case "reddit":
      return <BrandReddit className={className} />;
    case "search-console":
    case "google":
      return <BrandGoogle className={className} />;
    default:
      return <IconGlobe className={className} />;
  }
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
  const { showToast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "social" | "search" | "domain">("all");

  const domainConn = connections.find((c) => c.provider === "domain") || null;
  const connFor = (id: string) => connections.find((c) => c.provider === id);

  async function disconnect(provider: string, label: string) {
    if (!confirm(`Disconnect ${label}?`)) return;
    await fetch(`/api/sources/${provider}/disconnect`, { method: "DELETE" });
    showToast("Disconnected", `${label} connection was removed.`);
    window.location.reload();
  }

  async function syncSearchConsole() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/search-console/sync?days=28", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      const top = (data.topQueries || []).slice(0, 3) as { query: string; clicks: number }[];
      const topSummary = top.length > 0 ? ` (Top: ${top.map((t) => t.query).join(", ")})` : "";
      setSyncResult({
        ok: true,
        text: `Synced ${data.synced} search queries successfully.${topSummary}`,
      });
      showToast("Sync completed", `Synced ${data.synced} queries from Google Search Console.`);
      window.location.reload();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Sync failed";
      setSyncResult({ ok: false, text: errorMsg });
      showToast("Sync failed", errorMsg, "error");
    } finally {
      setSyncing(false);
    }
  }

  const filteredProviders = providers.filter((p) => {
    if (activeTab === "social") return ["linkedin", "twitter", "instagram", "youtube", "facebook", "reddit"].includes(p.id);
    if (activeTab === "search") return ["search-console"].includes(p.id);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("all")}
          className={`rounded-xl px-3.5 py-1.5 transition-colors ${
            activeTab === "all"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          All Sources (7)
        </button>
        <button
          onClick={() => setActiveTab("social")}
          className={`rounded-xl px-3.5 py-1.5 transition-colors ${
            activeTab === "social"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          Social Channels (6)
        </button>
        <button
          onClick={() => setActiveTab("search")}
          className={`rounded-xl px-3.5 py-1.5 transition-colors ${
            activeTab === "search"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          Search Console (1)
        </button>
        <button
          onClick={() => setActiveTab("domain")}
          className={`rounded-xl px-3.5 py-1.5 transition-colors ${
            activeTab === "domain"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          Website Domain
        </button>
      </div>

      {/* Social & OAuth Providers Grid */}
      {(activeTab === "all" || activeTab === "social") && (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredProviders.map((p) => {
            const conn = connFor(p.id);
            const connected = conn?.status === "connected";

            return (
              <div key={p.id} className="card p-5 space-y-4 hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                      style={{ background: p.color }}
                    >
                      {getProviderIcon(p.id, "h-5 w-5")}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-bold text-slate-900">{p.label}</h3>
                        {connected && (
                          <span className="badge border border-emerald-200/80 bg-emerald-50 text-emerald-700 text-[10px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulseDot" />
                            Connected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{p.description}</p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {connected ? (
                      <button
                        className="btn-danger text-xs px-3 py-1.5"
                        onClick={() => disconnect(p.id, p.label)}
                      >
                        Disconnect
                      </button>
                    ) : p.isOAuth ? (
                      p.configured ? (
                        <a className="btn-primary text-xs px-3.5 py-1.5" href={`/api/sources/${p.id}/connect`}>
                          Connect
                        </a>
                      ) : (
                        <span
                          className="badge border border-slate-200 bg-slate-100 text-slate-500 text-[11px]"
                          title={`Missing environment keys: ${p.missing.join(", ")}`}
                        >
                          Keys Required
                        </span>
                      )
                    ) : null}
                  </div>
                </div>

                {connected && conn?.accountName && (
                  <div className="rounded-xl border border-slate-200/70 bg-slate-50/50 p-2.5 text-xs flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Linked Account:</span>
                    <span className="font-bold text-slate-800">
                      {conn.accountUrl ? (
                        <a
                          href={conn.accountUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          {conn.accountName}
                          <IconExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        conn.accountName
                      )}
                    </span>
                  </div>
                )}

                {!connected && p.isOAuth && !p.configured && (
                  <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-3 text-[11px] text-amber-800 space-y-1">
                    <div className="font-semibold">Setup instructions:</div>
                    <p>
                      Add{" "}
                      {p.missing.map((m, i) => (
                        <span key={m}>
                          {i > 0 && ", "}
                          <code className="rounded bg-white px-1 py-0.5 font-mono text-[10px] border border-amber-200">
                            {m}
                          </code>
                        </span>
                      ))}{" "}
                      to your environment to activate one-click OAuth connection.
                    </p>
                  </div>
                )}

                {conn?.lastError && (
                  <p className="text-xs text-red-600 font-mono">{conn.lastError}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Website Domain Card */}
      {(activeTab === "all" || activeTab === "domain") && (
        <DomainCard initial={domainConn as DomainConn | null} />
      )}

      {/* Google Search Console Hub */}
      {(activeTab === "all" || activeTab === "search") && (
        <div className="card p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-sm">
                <BrandGoogle className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Google Search Console Query Sync</h3>
                  {searchConsole?.status === "connected" && (
                    <span className="badge border border-emerald-200/80 bg-emerald-50 text-emerald-700 text-[10px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulseDot" />
                      Connected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Retrieves the exact search terms, click-through rates, and ranking positions from Google Search.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {searchConsole?.status === "connected" ? (
                <>
                  <button
                    className="btn-primary text-xs"
                    onClick={syncSearchConsole}
                    disabled={syncing}
                  >
                    <IconRefresh className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                    {syncing ? "Syncing queries..." : "Sync Keywords"}
                  </button>
                  <button
                    className="btn-danger text-xs px-3"
                    onClick={() => disconnect("search-console", "Google Search Console")}
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <a className="btn-primary text-xs" href="/api/sources/search-console/connect">
                  Connect Search Console
                </a>
              )}
            </div>
          </div>

          {searchConsole?.lastSyncedAt && (
            <div className="text-xs text-slate-400 font-mono">
              Last synced: {new Date(searchConsole.lastSyncedAt).toLocaleString()}
            </div>
          )}

          {searchConsole?.lastError && (
            <p className="text-xs text-red-600 font-mono">{searchConsole.lastError}</p>
          )}

          {syncResult && (
            <div
              className={`rounded-xl p-3 text-xs border ${
                syncResult.ok
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {syncResult.text}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

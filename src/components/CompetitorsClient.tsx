"use client";

import { useState } from "react";
import {
  BrandLinkedIn,
  BrandTwitter,
  BrandInstagram,
  BrandYouTube,
  BrandFacebook,
  BrandReddit,
  IconTarget,
  IconRefresh,
  IconTrash,
  IconExternalLink,
  IconSparkles,
} from "./icons";
import { useToast } from "./Toast";

export interface CompetitorView {
  id: string;
  name: string;
  domain: string;
  website: string;
  meta?: { title?: string; description?: string; logo?: string; socials?: Record<string, string> } | null;
  platformsDetected: string[];
  lastFetchedAt?: string | null;
}

const ALL_PLATFORMS = [
  { id: "linkedin", label: "LinkedIn", icon: BrandLinkedIn },
  { id: "twitter", label: "X / Twitter", icon: BrandTwitter },
  { id: "instagram", label: "Instagram", icon: BrandInstagram },
  { id: "youtube", label: "YouTube", icon: BrandYouTube },
  { id: "facebook", label: "Facebook", icon: BrandFacebook },
  { id: "reddit", label: "Reddit", icon: BrandReddit },
];

export function CompetitorsClient({
  initialCompetitors,
  myPlatforms,
}: {
  initialCompetitors: CompetitorView[];
  myPlatforms: string[];
}) {
  const { showToast } = useToast();
  const [competitors, setCompetitors] = useState(initialCompetitors);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [err, setErr] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const cleanDomain = domain.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), domain: cleanDomain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add competitor");
      const c: CompetitorView = {
        id: data.competitor.id,
        name: data.competitor.name,
        domain: data.competitor.domain,
        website: data.competitor.website,
        meta: data.competitor.meta,
        platformsDetected: data.competitor.platformsDetected || [],
        lastFetchedAt: data.competitor.lastFetchedAt ? new Date(data.competitor.lastFetchedAt).toISOString() : null,
      };
      setCompetitors((cs) => [c, ...cs]);
      setName("");
      setDomain("");
      showToast("Competitor added", `Analyzed ${cleanDomain} and mapped their footprint.`);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed");
      showToast("Scan failed", ex instanceof Error ? ex.message : "Failed to scan competitor", "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, compName: string) {
    if (!confirm(`Remove ${compName} from tracked competitors?`)) return;
    const res = await fetch(`/api/competitors/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCompetitors((cs) => cs.filter((c) => c.id !== id));
      showToast("Competitor removed", `${compName} removed from surveillance.`);
    } else {
      showToast("Error removing competitor", "Please try again.", "error");
    }
  }

  async function refreshMeta(id: string, compName: string) {
    setRefreshingId(id);
    try {
      const res = await fetch(`/api/competitors/${id}`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.competitor) {
        setCompetitors((cs) =>
          cs.map((c) =>
            c.id === id
              ? {
                  ...c,
                  meta: data.competitor.meta,
                  platformsDetected: data.competitor.platformsDetected || [],
                  lastFetchedAt: new Date().toISOString(),
                }
              : c
          )
        );
        showToast("Footprint refreshed", `Updated intelligence for ${compName}.`);
      } else {
        throw new Error(data.error || "Failed");
      }
    } catch {
      showToast("Refresh failed", "Could not fetch competitor site right now.", "error");
    } finally {
      setRefreshingId(null);
    }
  }

  // Smart Opportunity & Gap Analysis
  const gaps: { text: string; kind: "gap" | "edge"; platform: string }[] = [];
  for (const p of ALL_PLATFORMS) {
    const onPlatform = competitors.filter((c) => c.platformsDetected.includes(p.id));
    if (onPlatform.length > 0 && !myPlatforms.includes(p.id)) {
      gaps.push({
        platform: p.label,
        kind: "gap",
        text: `Opportunity Gap: You are not active on ${p.label}, but ${onPlatform.map((c) => c.name).join(", ")} ${
          onPlatform.length > 1 ? "are" : "is"
        }. Claim your profile on ${p.label} to stop losing potential traffic.`,
      });
    }
    if (myPlatforms.includes(p.id) && onPlatform.length === 0 && competitors.length > 0) {
      gaps.push({
        platform: p.label,
        kind: "edge",
        text: `Channel Advantage: You own a presence on ${p.label} while none of your tracked competitors are active. Double down on this channel.`,
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Competitor Box */}
      <form onSubmit={add} className="card p-6 border-slate-200 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Track New Competitor</h3>
          <p className="text-xs text-slate-500">
            Enter a competitor domain. MQLeads will inspect their live website, uncover their social footprint, and map channel gaps.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label className="label">Competitor Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Acme Agency"
            />
          </div>
          <div className="min-w-[220px] flex-1">
            <label className="label">Domain or URL</label>
            <input
              className="input"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
              placeholder="e.g. acmeagency.com"
            />
          </div>
          <button className="btn-primary shrink-0 px-5" disabled={busy}>
            {busy ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Analyzing live site...
              </span>
            ) : (
              "+ Scan Competitor"
            )}
          </button>
        </div>

        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {err}
          </div>
        )}
      </form>

      {competitors.length > 0 ? (
        <>
          {/* Comparison Matrix Table */}
          <div className="card overflow-hidden">
            <div className="border-b border-slate-100 p-5 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Cross-Platform Channel Comparison Matrix</h3>
                <p className="text-xs text-slate-500">Real social presence verified from live website links.</p>
              </div>
              <span className="badge bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono text-xs">
                {competitors.length} Competitors Tracked
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/30">
                    <th className="th">Channel</th>
                    <th className="th text-center">
                      <span className="badge bg-indigo-600 text-white font-bold px-3">You</span>
                    </th>
                    {competitors.map((c) => (
                      <th key={c.id} className="th text-center truncate max-w-[160px]" title={c.name}>
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ALL_PLATFORMS.map((p) => {
                    const isMyPlatform = myPlatforms.includes(p.id);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="td font-bold text-slate-800 flex items-center gap-2.5">
                          <p.icon className="h-4 w-4 text-slate-500" />
                          <span>{p.label}</span>
                        </td>
                        <td className="td text-center">
                          {isMyPlatform ? (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                              ✓
                            </span>
                          ) : (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400 font-bold text-xs">
                              —
                            </span>
                          )}
                        </td>
                        {competitors.map((c) => {
                          const hasPlatform = c.platformsDetected.includes(p.id);
                          return (
                            <td key={c.id} className="td text-center">
                              {hasPlatform ? (
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">
                                  ✓
                                </span>
                              ) : (
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 text-slate-300 font-bold text-xs">
                                  —
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Gap Radar Insights Box */}
            {gaps.length > 0 && (
              <div className="border-t border-slate-100 bg-slate-50/40 p-5 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <IconSparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Actionable Opportunity Radar</span>
                </div>
                {gaps.map((g, i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-3 text-xs leading-relaxed border ${
                      g.kind === "gap"
                        ? "bg-amber-50/80 border-amber-200/80 text-amber-900"
                        : "bg-emerald-50/80 border-emerald-200/80 text-emerald-900"
                    }`}
                  >
                    {g.kind === "gap" ? "⚠️ " : "🚀 "}
                    {g.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Competitor Profile Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {competitors.map((c) => (
              <div key={c.id} className="card p-5 space-y-4 hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {c.meta?.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.meta.logo}
                        alt=""
                        className="h-11 w-11 rounded-xl border border-slate-200 object-contain p-1 bg-white shrink-0"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700 border border-slate-200">
                        {c.name[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-bold text-slate-900">{c.name}</h4>
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-xs font-mono text-indigo-600 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        {c.domain}
                        <IconExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => refreshMeta(c.id, c.name)}
                      disabled={refreshingId === c.id}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      title="Re-scan website footprint"
                    >
                      <IconRefresh
                        className={`h-4 w-4 ${refreshingId === c.id ? "animate-spin text-indigo-600" : ""}`}
                      />
                    </button>
                    <button
                      onClick={() => remove(c.id, c.name)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Remove competitor"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {c.meta?.description && (
                  <p className="line-clamp-2 text-xs text-slate-500 leading-relaxed">
                    {c.meta.description}
                  </p>
                )}

                <div className="space-y-1.5 border-t border-slate-100 pt-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Detected Active Channels ({c.platformsDetected.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.platformsDetected.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No social media links detected on homepage.</span>
                    ) : (
                      ALL_PLATFORMS.map((p) => {
                        if (!c.platformsDetected.includes(p.id)) return null;
                        const socialUrl = c.meta?.socials?.[p.id];
                        return socialUrl ? (
                          <a
                            key={p.id}
                            href={socialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="badge border border-slate-200 bg-slate-100/80 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors flex items-center gap-1.5 py-1 px-2 text-[11px]"
                          >
                            <p.icon className="h-3 w-3" />
                            <span>{p.label}</span>
                            <IconExternalLink className="h-2.5 w-2.5 opacity-60" />
                          </a>
                        ) : (
                          <span
                            key={p.id}
                            className="badge border border-slate-200 bg-slate-100 text-slate-700 py-1 px-2 text-[11px]"
                          >
                            <p.icon className="h-3 w-3" />
                            <span>{p.label}</span>
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>

                {c.lastFetchedAt && (
                  <div className="text-[10px] text-slate-400 font-mono">
                    Last scanned {new Date(c.lastFetchedAt).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="card p-12 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <IconTarget className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Competitors Under Surveillance</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Add your top competitors above by entering their domain (e.g. acme.com). MQLeads will inspect their active channels and show your opportunity gaps.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

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
  { id: "linkedin", label: "LinkedIn" },
  { id: "instagram", label: "Instagram" },
  { id: "twitter", label: "X / Twitter" },
  { id: "youtube", label: "YouTube" },
  { id: "facebook", label: "Facebook" },
  { id: "reddit", label: "Reddit" },
];

export function CompetitorsClient({
  initialCompetitors,
  myPlatforms,
}: {
  initialCompetitors: CompetitorView[];
  myPlatforms: string[];
}) {
  const [competitors, setCompetitors] = useState(initialCompetitors);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domain }),
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
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this competitor?")) return;
    await fetch(`/api/competitors/${id}`, { method: "DELETE" });
    setCompetitors((cs) => cs.filter((c) => c.id !== id));
  }

  async function refreshMeta(id: string) {
    const res = await fetch(`/api/competitors/${id}`, { method: "POST" });
    if (res.ok) window.location.reload();
  }

  // ---- gap analysis --------------------------------------------------------
  const gaps: { text: string; kind: "gap" | "edge" }[] = [];
  for (const p of ALL_PLATFORMS) {
    const onPlatform = competitors.filter((c) => c.platformsDetected.includes(p.id));
    if (onPlatform.length > 0 && !myPlatforms.includes(p.id)) {
      gaps.push({
        kind: "gap",
        text: `You are not on ${p.label} — but ${onPlatform.map((c) => c.name).join(", ")} ${onPlatform.length > 1 ? "are" : "is"}. That is where their leads are.`,
      });
    }
    if (myPlatforms.includes(p.id) && onPlatform.length === 0) {
      gaps.push({
        kind: "edge",
        text: `You are on ${p.label} and none of your tracked competitors are — own that channel.`,
      });
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="card flex flex-wrap items-end gap-3 p-5">
        <div className="min-w-[200px] flex-1">
          <label className="label">Competitor name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Acme Agency" />
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="label">Domain</label>
          <input className="input" value={domain} onChange={(e) => setDomain(e.target.value)} required placeholder="acme.com" />
        </div>
        <button className="btn-primary" disabled={busy}>
          {busy ? "Analyzing…" : "+ Add competitor"}
        </button>
        {err && <p className="w-full text-xs text-red-600">{err}</p>}
        <p className="w-full text-xs text-slate-400">
          MQLeads fetches their real website and detects which social platforms they are active on.
        </p>
      </form>

      {competitors.length > 0 && (
        <>
          <div className="card overflow-x-auto p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Platform comparison</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="th">Platform</th>
                  <th className="th text-center">
                    <span className="badge bg-indigo-100 text-indigo-700">You</span>
                  </th>
                  {competitors.map((c) => (
                    <th key={c.id} className="th text-center">
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ALL_PLATFORMS.map((p) => (
                  <tr key={p.id}>
                    <td className="td font-medium">{p.label}</td>
                    <td className="td text-center">
                      {myPlatforms.includes(p.id) ? (
                        <span className="text-emerald-600">✓</span>
                      ) : (
                        <span className="text-red-300">✗</span>
                      )}
                    </td>
                    {competitors.map((c) => (
                      <td key={c.id} className="td text-center">
                        {c.platformsDetected.includes(p.id) ? (
                          <span className="text-emerald-600">✓</span>
                        ) : (
                          <span className="text-slate-200">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {gaps.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                {gaps.map((g, i) => (
                  <p
                    key={i}
                    className={`rounded-lg px-3 py-2 text-xs ${
                      g.kind === "gap"
                        ? "bg-red-50 text-red-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {g.kind === "gap" ? "⚠️ " : "✅ "}
                    {g.text}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {competitors.map((c) => (
              <div key={c.id} className="card p-5">
                <div className="flex items-start gap-3">
                  {c.meta?.logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.meta.logo} alt="" className="h-10 w-10 rounded-lg border border-slate-100 object-contain" />
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-slate-900">{c.name}</h3>
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-xs text-indigo-600 hover:underline"
                    >
                      {c.website}
                    </a>
                    {c.meta?.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{c.meta.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button className="btn-ghost px-2 py-1 text-xs" onClick={() => refreshMeta(c.id)}>
                      Refresh
                    </button>
                    <button className="btn-danger px-2 py-1 text-xs" onClick={() => remove(c.id)}>
                      Remove
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {ALL_PLATFORMS.map((p) =>
                    c.platformsDetected.includes(p.id) ? (
                      <span key={p.id} className="badge bg-slate-100 text-slate-600">
                        {p.label}
                      </span>
                    ) : null
                  )}
                  {c.platformsDetected.length === 0 && (
                    <span className="text-xs text-slate-400">No social profiles detected yet.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {competitors.length === 0 && (
        <div className="card p-10 text-center">
          <p className="text-sm text-slate-500">
            Add a competitor by domain and MQLeads will analyze their real website — then compare it with your
            connected platforms.
          </p>
        </div>
      )}
    </div>
  );
}

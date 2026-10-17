"use client";

import { useMemo, useState } from "react";
import { SourceBadge } from "./SourceBadge";
import {
  IconSearch,
  IconDownload,
  IconFilter,
  IconX,
  IconLeads,
  IconExternalLink,
  IconSparkles,
  IconMail,
  IconTrash,
} from "./icons";
import { useToast } from "./Toast";

export interface LeadView {
  id: string;
  source: string;
  referrerSource?: string | null;
  person?: { name?: string; email?: string; handle?: string; via?: string } | null;
  landingPage?: string | null;
  referrerUrl?: string | null;
  utmSource?: string | null;
  utmCampaign?: string | null;
  utmMedium?: string | null;
  pageViews?: number;
  timeOnSiteSec?: number;
  score: number;
  status: string;
  note?: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  events: { type: string; page?: string; title?: string; url?: string; duration?: number; at: number }[];
}

const STATUSES = ["new", "contacted", "qualified", "converted", "closed"];

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  new: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200/80" },
  contacted: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200/80" },
  qualified: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200/80" },
  converted: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200/80" },
  closed: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
};

export function LeadsClient({ initialLeads }: { initialLeads: LeadView[] }) {
  const { showToast } = useToast();
  const [leads, setLeads] = useState(initialLeads);
  const [source, setSource] = useState("all");
  const [status, setStatus] = useState("all");
  const [tier, setTier] = useState("all");
  const [sortBy, setSortBy] = useState<"score" | "recent" | "views">("score");
  const [q, setQ] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const selectedLead = useMemo(() => {
    return leads.find((l) => l.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  const filtered = useMemo(() => {
    return leads
      .filter((l) => {
        if (source !== "all" && (l.referrerSource || l.source) !== source) return false;
        if (status !== "all" && l.status !== status) return false;
        if (tier === "hot" && l.score < 80) return false;
        if (tier === "warm" && (l.score < 25 || l.score >= 80)) return false;
        if (tier === "cold" && l.score >= 25) return false;
        if (q) {
          const hay = [
            l.person?.name,
            l.person?.email,
            l.person?.handle,
            l.landingPage,
            l.note,
            l.utmSource,
            l.utmCampaign,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!hay.includes(q.toLowerCase())) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "score") return b.score - a.score;
        if (sortBy === "views") return (b.pageViews || 0) - (a.pageViews || 0);
        return new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime();
      });
  }, [leads, source, status, tier, sortBy, q]);

  const sources = useMemo(() => {
    const set = new Set<string>();
    for (const l of leads) set.add(l.referrerSource || l.source);
    return Array.from(set).sort();
  }, [leads]);

  // Lead metrics
  const hotCount = leads.filter((l) => l.score >= 25).length;
  const convertedCount = leads.filter((l) => l.status === "converted").length;

  async function updateStatus(id: string, next: string) {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status: next } : l)));
      showToast("Status updated", `Lead marked as ${next}.`);
    } else {
      showToast("Error updating status", "Please try again.", "error");
    }
  }

  async function saveNote(id: string) {
    const note = noteDrafts[id] ?? "";
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    if (res.ok) {
      setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, note } : l)));
      showToast("Note saved", "Lead activity notes updated successfully.");
    } else {
      showToast("Error saving note", "Please try again.", "error");
    }
  }

  async function addLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        person: {
          name: form.get("name"),
          email: form.get("email"),
          handle: form.get("handle"),
        },
        company: form.get("company"),
        url: form.get("url"),
        note: form.get("note"),
      }),
    });
    if (res.ok) {
      showToast("Lead added", "New lead added to pipeline.");
      setShowAdd(false);
      window.location.reload();
    } else {
      showToast("Could not add lead", "Please check your inputs.", "error");
    }
  }

  async function deleteLead(id: string) {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
    if (res.ok) {
      setLeads((ls) => ls.filter((l) => l.id !== id));
      if (selectedLeadId === id) setSelectedLeadId(null);
      showToast("Lead deleted", "The lead record was removed.");
    } else {
      showToast("Failed to delete lead", "Please try again.", "error");
    }
  }

  function exportCSV() {
    if (filtered.length === 0) {
      showToast("No leads to export", "Try adjusting your filters.", "info");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Social Handle",
      "Attribution Source",
      "Intent Score",
      "Status",
      "Landing Page",
      "UTM Campaign",
      "Page Views",
      "Time on Site (sec)",
      "First Seen",
      "Last Seen",
      "Notes",
    ];

    const rows = filtered.map((l) => [
      `"${(l.person?.name || "").replace(/"/g, '""')}"`,
      `"${(l.person?.email || "").replace(/"/g, '""')}"`,
      `"${(l.person?.handle || "").replace(/"/g, '""')}"`,
      `"${(l.referrerSource || l.source || "").replace(/"/g, '""')}"`,
      l.score,
      `"${l.status}"`,
      `"${(l.landingPage || "").replace(/"/g, '""')}"`,
      `"${(l.utmCampaign || "").replace(/"/g, '""')}"`,
      l.pageViews || 1,
      l.timeOnSiteSec || 0,
      `"${l.firstSeenAt}"`,
      `"${l.lastSeenAt}"`,
      `"${(l.note || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mqleads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("CSV Exported", `Exported ${filtered.length} leads successfully.`);
  }

  return (
    <div className="space-y-6">
      {/* Header Pipeline Stats Banner */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Leads</div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-1">{leads.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">Hot Intent (≥25)</div>
          <div className="text-2xl font-extrabold font-mono text-emerald-700 mt-1">{hotCount}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">Qualified</div>
          <div className="text-2xl font-extrabold font-mono text-indigo-700 mt-1">
            {leads.filter((l) => l.status === "qualified").length}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-violet-600">Converted</div>
          <div className="text-2xl font-extrabold font-mono text-violet-700 mt-1">{convertedCount}</div>
        </div>
      </div>

      {/* Action & Filter Toolbar */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative min-w-[240px] flex-1">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="input pl-10"
              placeholder="Search leads by name, email, handle, campaign, page..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <IconX className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <button onClick={exportCSV} className="btn-secondary text-xs font-semibold">
              <IconDownload className="h-4 w-4 text-slate-500" />
              Export CSV
            </button>
            <button onClick={() => setShowAdd((v) => !v)} className="btn-primary text-xs font-semibold">
              {showAdd ? "Cancel" : "+ Add Lead"}
            </button>
          </div>
        </div>

        {/* Multi-Filters Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
            <IconFilter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <option value="all">All Channels</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={tier}
            onChange={(e) => setTier(e.target.value)}
          >
            <option value="all">All Intent Tiers</option>
            <option value="hot">🔥 Hot Intent (≥80)</option>
            <option value="warm">⚡ Warm Leads (25-79)</option>
            <option value="cold">❄️ Casual Visitors (&lt;25)</option>
          </select>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Sort:</span>
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "score" | "recent" | "views")}
            >
              <option value="score">Highest Intent Score</option>
              <option value="recent">Most Recently Active</option>
              <option value="views">Most Page Views</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Lead Form Drawer */}
      {showAdd && (
        <form onSubmit={addLead} className="card p-6 border-indigo-200 bg-indigo-50/30 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Add Manual Prospect</h3>
            <button type="button" onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
              <IconX className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="label">Company / Account Name *</label>
              <input name="company" className="input" required placeholder="Acme Global Inc" />
            </div>
            <div>
              <label className="label">Contact Person Name</label>
              <input name="name" className="input" placeholder="Rahul Sharma" />
            </div>
            <div>
              <label className="label">Work Email</label>
              <input name="email" type="email" className="input" placeholder="rahul@acme.com" />
            </div>
            <div>
              <label className="label">Social Handle</label>
              <input name="handle" className="input" placeholder="in/rahul-sharma" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Website or Landing URL</label>
              <input name="url" className="input" placeholder="https://acme.com" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Prospect Notes</label>
              <input name="note" className="input" placeholder="Found on LinkedIn, expressed interest in enterprise plan." />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save to Pipeline
            </button>
          </div>
        </form>
      )}

      {/* Main Leads Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <IconLeads className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {leads.length === 0 ? "No leads in pipeline yet" : "No leads match current filters"}
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {leads.length === 0
                ? "Install your website tracking snippet or link social sources. Real visitors will be scored and listed here automatically."
                : "Try resetting your search query, status, or channel filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="th">Prospect</th>
                  <th className="th">Channel Source</th>
                  <th className="th hidden md:table-cell">Landing Page</th>
                  <th className="th hidden sm:table-cell text-center">Pages</th>
                  <th className="th hidden lg:table-cell text-center">Duration</th>
                  <th className="th text-center">Score</th>
                  <th className="th">Status</th>
                  <th className="th text-right">Last Seen</th>
                  <th className="th text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((l) => {
                  const name = l.person?.name || l.person?.email || l.person?.handle || "Anonymous Prospect";
                  const sub = l.person?.email || l.person?.handle || l.landingPage || "—";
                  const statusStyle = STATUS_STYLES[l.status] || STATUS_STYLES.new;
                  const isHot = l.score >= 25;

                  return (
                    <tr
                      key={l.id}
                      onClick={() => setSelectedLeadId(l.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedLeadId === l.id ? "bg-indigo-50/60" : "hover:bg-slate-50/80"
                      }`}
                    >
                      <td className="td">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-xs text-slate-700 border border-slate-200">
                            {name[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                              <span className="truncate">{name}</span>
                              {isHot && (
                                <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200/60">
                                  HOT
                                </span>
                              )}
                            </div>
                            <div className="truncate text-xs text-slate-400 max-w-[200px]">{sub}</div>
                          </div>
                        </div>
                      </td>

                      <td className="td">
                        <SourceBadge source={l.referrerSource || l.source} />
                        {l.utmCampaign && (
                          <div className="mt-1 text-[10px] text-slate-400 font-mono">
                            camp:{l.utmCampaign}
                          </div>
                        )}
                      </td>

                      <td className="td hidden md:table-cell max-w-[200px] truncate text-xs text-slate-500 font-mono">
                        {l.landingPage || "/"}
                      </td>

                      <td className="td hidden sm:table-cell text-center font-mono text-xs font-semibold text-slate-700">
                        {l.pageViews ?? 1}
                      </td>

                      <td className="td hidden lg:table-cell text-center font-mono text-xs text-slate-500">
                        {l.timeOnSiteSec ? `${Math.round(l.timeOnSiteSec / 60)}m` : "< 1m"}
                      </td>

                      <td className="td text-center">
                        <span
                          className={`badge font-mono ${
                            l.score >= 80
                              ? "border border-emerald-200/80 bg-emerald-50 text-emerald-700 font-bold"
                              : l.score >= 25
                              ? "border border-indigo-200/80 bg-indigo-50 text-indigo-700 font-semibold"
                              : "border border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          {l.score} pts
                        </span>
                      </td>

                      <td className="td" onClick={(e) => e.stopPropagation()}>
                        <select
                          className={`badge cursor-pointer border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} capitalize text-xs font-semibold`}
                          value={l.status}
                          onChange={(e) => updateStatus(l.id, e.target.value)}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="td text-right whitespace-nowrap text-xs text-slate-400 font-mono">
                        {new Date(l.lastSeenAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </td>

                      <td className="td text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedLeadId(l.id)}
                          className="btn-secondary text-xs px-2.5 py-1"
                        >
                          Dossier
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Lead Intelligence Dossier Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative h-full w-full max-w-xl bg-white shadow-2xl flex flex-col justify-between overflow-y-auto">
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 py-4 backdrop-blur-md">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm">
                  {(selectedLead.person?.name || selectedLead.person?.email || "L")[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-900">
                    {selectedLead.person?.name || selectedLead.person?.email || "Anonymous Prospect"}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <SourceBadge source={selectedLead.referrerSource || selectedLead.source} />
                    <span>·</span>
                    <span>First seen {new Date(selectedLead.firstSeenAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedLeadId(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Content Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Intent Score Overview */}
              <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 to-violet-50/70 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700">
                      <IconSparkles className="h-3.5 w-3.5" />
                      Lead Intent Score
                    </div>
                    <div className="text-3xl font-extrabold font-mono text-slate-900 mt-1">
                      {selectedLead.score} <span className="text-xs font-normal text-slate-500">/ 100 max</span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span
                      className={`badge border ${
                        STATUS_STYLES[selectedLead.status]?.bg || "bg-slate-100"
                      } ${STATUS_STYLES[selectedLead.status]?.text || "text-slate-700"} capitalize`}
                    >
                      {selectedLead.status}
                    </span>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {selectedLead.pageViews || 1} views · {Math.round((selectedLead.timeOnSiteSec || 0) / 60)}m active
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact / Social Identifiers */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Profile &amp; Channel Identifiers
                </h4>
                <div className="grid gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Email:</span>
                    <span className="font-mono text-slate-800">
                      {selectedLead.person?.email ? (
                        <a
                          href={`mailto:${selectedLead.person.email}`}
                          className="text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          <IconMail className="h-3.5 w-3.5" />
                          {selectedLead.person.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Social Handle:</span>
                    <span className="font-mono text-slate-800">
                      {selectedLead.person?.handle || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Referrer URL:</span>
                    <span className="font-mono text-slate-800 truncate max-w-[280px]">
                      {selectedLead.referrerUrl ? (
                        <a
                          href={selectedLead.referrerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          {selectedLead.referrerUrl}
                          <IconExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        "—"
                      )}
                    </span>
                  </div>

                  {selectedLead.utmCampaign && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Campaign UTM:</span>
                      <span className="font-mono text-indigo-600 font-bold">
                        {selectedLead.utmCampaign}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Landing Page:</span>
                    <span className="font-mono text-slate-800">{selectedLead.landingPage || "/"}</span>
                  </div>
                </div>
              </div>

              {/* Visitor Journey Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Engagement &amp; Event Timeline
                </h4>
                {selectedLead.events.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No detailed events logged for this prospect.</p>
                ) : (
                  <div className="space-y-3 border-l-2 border-indigo-200 pl-4 ml-2 text-xs">
                    {selectedLead.events.map((ev, i) => (
                      <div key={i} className="relative space-y-1">
                        <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-indigo-600 ring-4 ring-white" />
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 capitalize">{ev.type}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(ev.at).toLocaleTimeString()}
                          </span>
                        </div>
                        {ev.page && <div className="text-slate-600 font-mono">Page: {ev.page}</div>}
                        {ev.title && <div className="text-slate-500">{ev.title}</div>}
                        {ev.duration && (
                          <div className="text-[11px] text-emerald-600 font-mono">
                            Time on page: {Math.round(ev.duration)}s
                          </div>
                        )}
                        {ev.url && (
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:underline truncate block"
                          >
                            {ev.url}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity Notes Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Prospect Notes &amp; Outreach Log
                </h4>
                <textarea
                  className="input min-h-[100px] text-xs leading-relaxed"
                  value={noteDrafts[selectedLead.id] ?? selectedLead.note ?? ""}
                  onChange={(e) =>
                    setNoteDrafts((d) => ({ ...d, [selectedLead.id]: e.target.value }))
                  }
                  placeholder="Record outreach notes, discovery details, next steps..."
                />
                <div className="flex justify-between items-center pt-1">
                  <button
                    onClick={() => saveNote(selectedLead.id)}
                    className="btn-primary text-xs"
                  >
                    Save Notes
                  </button>
                  <button
                    onClick={() => deleteLead(selectedLead.id)}
                    className="btn-danger text-xs px-3"
                  >
                    <IconTrash className="h-3.5 w-3.5" />
                    Delete Lead
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

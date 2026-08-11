"use client";

import { useMemo, useState } from "react";
import { SourceBadge } from "./SourceBadge";

export interface LeadView {
  id: string;
  source: string;
  referrerSource?: string | null;
  person?: { name?: string; email?: string; handle?: string; via?: string } | null;
  landingPage?: string | null;
  referrerUrl?: string | null;
  utmSource?: string | null;
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

const STATUS_STYLES: Record<string, string> = {
  new: "bg-indigo-100 text-indigo-700",
  contacted: "bg-amber-100 text-amber-700",
  qualified: "bg-sky-100 text-sky-700",
  converted: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-200 text-slate-600",
};

export function LeadsClient({ initialLeads }: { initialLeads: LeadView[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [source, setSource] = useState("all");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (source !== "all" && (l.referrerSource || l.source) !== source) return false;
      if (status !== "all" && l.status !== status) return false;
      if (q) {
        const hay = [l.person?.name, l.person?.email, l.person?.handle, l.landingPage, l.note]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [leads, source, status, q]);

  const sources = useMemo(() => {
    const set = new Set<string>();
    for (const l of leads) set.add(l.referrerSource || l.source);
    return Array.from(set).sort();
  }, [leads]);

  async function updateStatus(id: string, next: string) {
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status: next } : l)));
  }

  async function saveNote(id: string) {
    const note = noteDrafts[id] ?? "";
    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    if (res.ok) setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, note } : l)));
  }

  async function addLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        person: { name: form.get("name"), email: form.get("email") },
        company: form.get("company"),
        url: form.get("url"),
        note: form.get("note"),
      }),
    });
    if (res.ok) {
      setShowAdd(false);
      window.location.reload();
    }
  }

  async function deleteLead(id: string) {
    if (!confirm("Delete this lead?")) return;
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    setLeads((ls) => ls.filter((l) => l.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search name, email, page…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="input max-w-[160px]" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="all">All sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select className="input max-w-[160px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <div className="flex-1" />
        <button className="btn-primary" onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? "Cancel" : "+ Add lead"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={addLead} className="card grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="label">Name / company</label>
            <input name="company" className="input" required placeholder="Acme Corp" />
          </div>
          <div>
            <label className="label">Person</label>
            <input name="name" className="input" placeholder="Rahul Sharma" />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" className="input" placeholder="rahul@acme.com" />
          </div>
          <div>
            <label className="label">Website</label>
            <input name="url" className="input" placeholder="acme.com" />
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full">Save lead</button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">
            {leads.length === 0
              ? "No leads yet. Install the tracking snippet on your site — visitors who show intent become leads automatically. Or add one manually."
              : "No leads match the current filters."}
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="th">Lead</th>
                <th className="th">Source</th>
                <th className="th hidden md:table-cell">Landing page</th>
                <th className="th hidden sm:table-cell">Pages</th>
                <th className="th hidden lg:table-cell">Time</th>
                <th className="th">Score</th>
                <th className="th">Status</th>
                <th className="th">Seen</th>
                <th className="th" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((l) => (
                <LeadTableRow
                  key={l.id}
                  lead={l}
                  expanded={expanded === l.id}
                  onToggle={() => setExpanded(expanded === l.id ? null : l.id)}
                  onStatus={(s) => updateStatus(l.id, s)}
                  noteDraft={noteDrafts[l.id] ?? l.note ?? ""}
                  onNote={(v) => setNoteDrafts((d) => ({ ...d, [l.id]: v }))}
                  onSaveNote={() => saveNote(l.id)}
                  onDelete={() => deleteLead(l.id)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function LeadTableRow(props: {
  lead: LeadView;
  expanded: boolean;
  onToggle: () => void;
  onStatus: (s: string) => void;
  noteDraft: string;
  onNote: (v: string) => void;
  onSaveNote: () => void;
  onDelete: () => void;
}) {
  const { lead: l, expanded, onToggle, onStatus, noteDraft, onNote, onSaveNote, onDelete } = props;
  const name = l.person?.name || l.person?.email || l.person?.handle || "Anonymous visitor";
  const sub = l.person?.email || l.person?.handle || l.landingPage || "—";

  return (
    <>
      <tr className="cursor-pointer hover:bg-slate-50/60" onClick={onToggle}>
        <td className="td">
          <div className="font-medium text-slate-900">{name}</div>
          <div className="max-w-[220px] truncate text-xs text-slate-400">{sub}</div>
        </td>
        <td className="td">
          <SourceBadge source={l.referrerSource || l.source} />
          {l.utmSource && <div className="mt-1 text-[10px] text-slate-400">utm:{l.utmSource}</div>}
        </td>
        <td className="td hidden max-w-[220px] truncate md:table-cell">{l.landingPage || "—"}</td>
        <td className="td hidden sm:table-cell">{l.pageViews ?? "—"}</td>
        <td className="td hidden lg:table-cell">
          {l.timeOnSiteSec ? `${Math.round(l.timeOnSiteSec / 60)}m` : "—"}
        </td>
        <td className="td">
          <span className={`badge ${l.score >= 25 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
            {l.score}
          </span>
        </td>
        <td className="td" onClick={(e) => e.stopPropagation()}>
          <select
            className={`badge cursor-pointer appearance-none border-0 ${STATUS_STYLES[l.status] || ""}`}
            value={l.status}
            onChange={(e) => onStatus(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </td>
        <td className="td whitespace-nowrap text-xs text-slate-400">
          {new Date(l.lastSeenAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </td>
        <td className="td">
          <button className="btn-ghost px-2 py-1" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
            {expanded ? "−" : "+"}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={9} className="bg-slate-50/60 p-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Visitor timeline
                </h4>
                {l.events.length === 0 ? (
                  <p className="text-sm text-slate-400">No tracked events for this lead.</p>
                ) : (
                  <ol className="space-y-2">
                    {l.events.map((ev, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                        <div className="min-w-0">
                          <span className="font-medium capitalize text-slate-700">{ev.type}</span>
                          {ev.page && <span className="text-slate-500"> — {ev.page}</span>}
                          {ev.title && <div className="text-xs text-slate-400">{ev.title}</div>}
                          {ev.url && (
                            <a href={ev.url} target="_blank" rel="noreferrer" className="block truncate text-xs text-indigo-600 hover:underline">
                              {ev.url}
                            </a>
                          )}
                          {ev.duration && <div className="text-xs text-slate-400">{Math.round(ev.duration)}s on page</div>}
                          <div className="text-[10px] text-slate-300">
                            {new Date(ev.at).toLocaleString()}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</h4>
                <textarea
                  className="input min-h-[90px]"
                  value={noteDraft}
                  onChange={(e) => onNote(e.target.value)}
                  placeholder="Add a note about this lead…"
                />
                <div className="mt-2 flex gap-2">
                  <button className="btn-secondary" onClick={onSaveNote}>
                    Save note
                  </button>
                  <button className="btn-danger" onClick={onDelete}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

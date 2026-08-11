import Link from "next/link";
import type { LeadDoc } from "@/lib/models";
import { SourceBadge } from "./SourceBadge";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-indigo-100 text-indigo-700",
  contacted: "bg-amber-100 text-amber-700",
  qualified: "bg-sky-100 text-sky-700",
  converted: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-200 text-slate-600",
};

export function LeadRow({ lead }: { lead: LeadDoc }) {
  const name = lead.person?.name || lead.person?.email || lead.person?.handle || "Anonymous visitor";
  const detail = lead.person?.email || lead.person?.handle || lead.landingPage || lead.referrerUrl;

  return (
    <div className="flex items-center gap-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-slate-900">{name}</div>
        <div className="truncate text-xs text-slate-400">{detail}</div>
      </div>
      <SourceBadge source={lead.referrerSource || lead.source} className="hidden sm:inline-flex" />
      <div className="w-16 text-right text-sm font-semibold text-slate-700">{lead.score}</div>
      <span className={`badge ${STATUS_STYLES[lead.status] || ""}`}>{lead.status}</span>
      <Link
        href={`/dashboard/leads?id=${lead._id.toString()}`}
        className="text-xs font-medium text-indigo-600 hover:underline"
      >
        View
      </Link>
    </div>
  );
}

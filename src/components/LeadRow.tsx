import Link from "next/link";
import type { LeadDoc } from "@/lib/models";
import { SourceBadge } from "./SourceBadge";
import { IconChevronRight } from "./icons";

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  new: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200/80" },
  contacted: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200/80" },
  qualified: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200/80" },
  converted: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200/80" },
  closed: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
};

export function LeadRow({ lead }: { lead: LeadDoc }) {
  const name = lead.person?.name || lead.person?.email || lead.person?.handle || "Anonymous Visitor";
  const detail = lead.person?.email || lead.person?.handle || lead.landingPage || lead.referrerUrl || "Direct arrival";
  const statusStyle = STATUS_STYLES[lead.status] || STATUS_STYLES.new;

  const isHot = lead.score >= 25;

  return (
    <div className="group flex items-center justify-between gap-4 py-3.5 px-2 hover:bg-slate-50/80 rounded-xl transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200/80 group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors">
          {name[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-bold text-slate-900">{name}</span>
            {isHot && (
              <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                HOT
              </span>
            )}
          </div>
          <div className="truncate text-xs text-slate-400 mt-0.5">{detail}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <SourceBadge source={lead.referrerSource || lead.source} className="hidden sm:inline-flex" />

        <div className="text-right">
          <div className="text-xs font-bold font-mono text-slate-800">
            {lead.score} <span className="text-[10px] text-slate-400 font-normal">pts</span>
          </div>
          <div className="text-[10px] text-slate-400">{lead.pageViews || 1} views</div>
        </div>

        <span className={`badge border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} capitalize text-[11px]`}>
          {lead.status}
        </span>

        <Link
          href={`/dashboard/leads?id=${lead._id.toString()}`}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
          title="View lead details"
        >
          <IconChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

const SOURCE_STYLES: Record<string, string> = {
  linkedin: "bg-sky-100 text-sky-700",
  instagram: "bg-pink-100 text-pink-700",
  twitter: "bg-slate-200 text-slate-800",
  youtube: "bg-red-100 text-red-700",
  facebook: "bg-blue-100 text-blue-700",
  reddit: "bg-orange-100 text-orange-700",
  google: "bg-indigo-100 text-indigo-700",
  bing: "bg-cyan-100 text-cyan-700",
  yahoo: "bg-violet-100 text-violet-700",
  duckduckgo: "bg-amber-100 text-amber-700",
  whatsapp: "bg-emerald-100 text-emerald-700",
  telegram: "bg-sky-100 text-sky-700",
  pinterest: "bg-red-100 text-red-700",
  tiktok: "bg-slate-800 text-white",
  messenger: "bg-blue-100 text-blue-700",
  tracking: "bg-slate-100 text-slate-600",
  manual: "bg-slate-100 text-slate-600",
};

const LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  twitter: "X / Twitter",
  youtube: "YouTube",
  facebook: "Facebook",
  reddit: "Reddit",
  google: "Google",
  bing: "Bing",
  yahoo: "Yahoo",
  duckduckgo: "DuckDuckGo",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  pinterest: "Pinterest",
  tiktok: "TikTok",
  messenger: "Messenger",
  tracking: "Site visitor",
  manual: "Manual",
  "search-console": "Google Search",
};

export function SourceBadge({ source, className = "" }: { source: string | null | undefined; className?: string }) {
  if (!source) return <span className={`badge bg-slate-100 text-slate-500 ${className}`}>direct</span>;
  return (
    <span className={`badge ${SOURCE_STYLES[source] || "bg-slate-100 text-slate-600"} ${className}`}>
      {LABELS[source] || source}
    </span>
  );
}

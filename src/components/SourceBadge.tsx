import React from "react";
import {
  BrandLinkedIn,
  BrandInstagram,
  BrandTwitter,
  BrandYouTube,
  BrandFacebook,
  BrandReddit,
  BrandGoogle,
  IconGlobe,
  IconPulse,
  IconLeads,
} from "./icons";

const SOURCE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  linkedin: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200/80" },
  instagram: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200/80" },
  twitter: { bg: "bg-slate-100", text: "text-slate-900", border: "border-slate-300" },
  youtube: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200/80" },
  facebook: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200/80" },
  reddit: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200/80" },
  google: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200/80" },
  bing: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200/80" },
  yahoo: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200/80" },
  duckduckgo: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200/80" },
  whatsapp: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200/80" },
  telegram: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200/80" },
  pinterest: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200/80" },
  tiktok: { bg: "bg-slate-900", text: "text-white", border: "border-slate-800" },
  messenger: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200/80" },
  tracking: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
  manual: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
  "search-console": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200/80" },
  domain: { bg: "bg-slate-900", text: "text-white", border: "border-slate-800" },
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
  tracking: "Tracking Script",
  manual: "Manual Entry",
  "search-console": "Search Console",
  domain: "Website Domain",
};

export function SourceIcon({ source, className = "h-3.5 w-3.5" }: { source: string | null | undefined; className?: string }) {
  if (!source) return <IconGlobe className={className} />;
  switch (source.toLowerCase()) {
    case "linkedin":
      return <BrandLinkedIn className={className} />;
    case "instagram":
      return <BrandInstagram className={className} />;
    case "twitter":
      return <BrandTwitter className={className} />;
    case "youtube":
      return <BrandYouTube className={className} />;
    case "facebook":
      return <BrandFacebook className={className} />;
    case "reddit":
      return <BrandReddit className={className} />;
    case "google":
    case "search-console":
      return <BrandGoogle className={className} />;
    case "tracking":
      return <IconPulse className={className} />;
    case "manual":
      return <IconLeads className={className} />;
    default:
      return <IconGlobe className={className} />;
  }
}

export function SourceBadge({
  source,
  showIcon = true,
  className = "",
}: {
  source: string | null | undefined;
  showIcon?: boolean;
  className?: string;
}) {
  if (!source) {
    return (
      <span className={`badge border border-slate-200/70 bg-slate-100/80 text-slate-600 ${className}`}>
        {showIcon && <IconGlobe className="h-3 w-3 text-slate-400" />}
        Direct
      </span>
    );
  }

  const s = source.toLowerCase();
  const style = SOURCE_STYLES[s] || { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" };
  const label = LABELS[s] || source;

  return (
    <span className={`badge border ${style.bg} ${style.text} ${style.border} ${className}`}>
      {showIcon && <SourceIcon source={s} className="h-3 w-3 shrink-0" />}
      <span>{label}</span>
    </span>
  );
}

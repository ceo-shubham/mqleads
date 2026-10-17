import React from "react";

export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 40 40" fill="none" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mqleads-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#mqleads-grad)" />
        <rect x="1" y="1" width="38" height="38" rx="9" stroke="url(#glow-grad)" strokeWidth="1.5" />
        {/* Modern stylized geometric "M & Q" node network */}
        <path
          d="M11 27V13L17 21L23 13V27"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="28" cy="24" r="4.5" stroke="#ffffff" strokeWidth="2.2" />
        <path d="M31 27L33.5 29.5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

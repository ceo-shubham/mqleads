"use client";

import { useState } from "react";
import { IconCopy, IconCheck } from "./icons";
import { useToast } from "./Toast";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    showToast("Copied to clipboard", `${label} copied.`);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button className="btn-secondary shrink-0 text-xs px-3 py-1.5" onClick={copy}>
      {copied ? <IconCheck className="h-3.5 w-3.5 text-emerald-600" /> : <IconCopy className="h-3.5 w-3.5" />}
      <span>{copied ? "Copied!" : label}</span>
    </button>
  );
}

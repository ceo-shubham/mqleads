"use client";

import { useState } from "react";
import { IconCopy, IconGlobe, IconRefresh, IconTrash } from "./icons";
import { useToast } from "./Toast";

export interface DomainConn {
  id: string;
  domain?: string;
  status: string;
  verificationToken?: string;
  verifiedAt?: string | null;
  lastError?: string | null;
}

export function DomainCard({ initial }: { initial: DomainConn | null }) {
  const { showToast } = useToast();
  const [conn, setConn] = useState<DomainConn | null>(initial);
  const [domainInput, setDomainInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function addDomain(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const clean = domainInput.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "");
      const res = await fetch("/api/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: clean }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add domain");
      setConn({ id: data.id, domain: clean, status: "pending", verificationToken: data.verificationToken });
      showToast("Domain added", "Please verify ownership using DNS or Meta tag.");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to add domain";
      setMsg({ kind: "err", text: errMsg });
      showToast("Error", errMsg, "error");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (!conn) return;
    setBusy(true);
    setMsg({ kind: "ok", text: "Checking DNS and HTML meta tag verification records..." });
    try {
      const res = await fetch("/api/domain/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: conn.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      const successText = `Verified via ${data.method === "dns" ? "DNS TXT record" : "HTML Meta tag"} 🎉`;
      setMsg({ kind: "ok", text: successText });
      setConn((c) => (c ? { ...c, status: "connected", verifiedAt: new Date().toISOString(), lastError: null } : c));
      showToast("Domain verified", "Your domain is now verified and active.");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Verification failed";
      setMsg({ kind: "err", text: errMsg });
      showToast("Verification failed", errMsg, "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!conn) return;
    if (!confirm("Are you sure you want to remove this domain?")) return;
    setBusy(true);
    try {
      await fetch(`/api/domain?id=${conn.id}`, { method: "DELETE" });
      setConn(null);
      setMsg(null);
      showToast("Domain removed", "The domain was detached.");
    } catch {
      setMsg({ kind: "err", text: "Could not remove domain" });
      showToast("Error", "Could not remove domain", "error");
    } finally {
      setBusy(false);
    }
  }

  const token = conn?.verificationToken || "";

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard", `${label} copied.`);
  }

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <IconGlobe className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Website Domain Tracking</h3>
              {conn?.verifiedAt && (
                <span className="badge border border-emerald-200/80 bg-emerald-50 text-emerald-700 text-[10px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulseDot" />
                  Verified &amp; Active
                </span>
              )}
              {conn && !conn.verifiedAt && (
                <span className="badge border border-amber-200/80 bg-amber-50 text-amber-700 text-[10px]">
                  Verification Pending
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {conn?.domain ? conn.domain : "Connect and verify your website domain to capture attributed visitors."}
            </p>
          </div>
        </div>

        {conn && (
          <button
            onClick={remove}
            disabled={busy}
            className="btn-danger text-xs px-3 py-1.5"
          >
            <IconTrash className="h-3.5 w-3.5" />
            Remove Domain
          </button>
        )}
      </div>

      {!conn ? (
        <form onSubmit={addDomain} className="flex gap-2 pt-2">
          <input
            className="input"
            placeholder="e.g. yourcompany.com"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            required
          />
          <button className="btn-primary shrink-0" disabled={busy}>
            {busy ? "Adding..." : "+ Add Domain"}
          </button>
        </form>
      ) : (
        !conn.verifiedAt && (
          <div className="mt-4 space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 text-xs">
            <div className="font-bold text-slate-800">Choose one method to verify ownership:</div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2">
                <div className="font-bold text-slate-900">Method A: DNS TXT Record</div>
                <p className="text-slate-500">Add a TXT record to your DNS provider:</p>
                <div className="rounded-lg bg-slate-100 p-2 font-mono text-[11px] text-slate-700 space-y-1">
                  <div><b>Host:</b> _mqleads.{conn.domain}</div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate"><b>Value:</b> {token}</span>
                    <button
                      type="button"
                      onClick={() => copyText(token, "Verification token")}
                      className="p-1 hover:text-indigo-600"
                    >
                      <IconCopy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2">
                <div className="font-bold text-slate-900">Method B: HTML Meta Tag</div>
                <p className="text-slate-500">Paste inside your site&apos;s <code className="text-indigo-600">&lt;head&gt;</code>:</p>
                <div className="rounded-lg bg-slate-100 p-2 font-mono text-[11px] text-slate-700 flex items-center justify-between gap-1">
                  <span className="truncate">&lt;meta name=&quot;mqleads-site-verification&quot; content=&quot;{token}&quot; /&gt;</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyText(`<meta name="mqleads-site-verification" content="${token}" />`, "Meta tag")
                    }
                    className="p-1 hover:text-indigo-600 shrink-0"
                  >
                    <IconCopy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button className="btn-primary text-xs" onClick={verify} disabled={busy}>
                <IconRefresh className={`h-3.5 w-3.5 ${busy ? "animate-spin" : ""}`} />
                {busy ? "Checking records..." : "Verify Ownership Now"}
              </button>
            </div>
          </div>
        )
      )}

      {msg && (
        <div
          className={`rounded-xl p-3 text-xs border ${
            msg.kind === "ok" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {msg.text}
        </div>
      )}
    </div>
  );
}

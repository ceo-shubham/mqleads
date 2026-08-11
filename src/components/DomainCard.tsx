"use client";

import { useState } from "react";

export interface DomainConn {
  id: string;
  domain?: string;
  status: string;
  verificationToken?: string;
  verifiedAt?: string | null;
  lastError?: string | null;
}

export function DomainCard({ initial }: { initial: DomainConn | null }) {
  const [conn, setConn] = useState<DomainConn | null>(initial);
  const [domainInput, setDomainInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function addDomain(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domainInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add domain");
      setConn({ id: data.id, domain: domainInput.trim(), status: "pending", verificationToken: data.verificationToken });
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Failed" });
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (!conn) return;
    setBusy(true);
    setMsg({ kind: "ok", text: "Checking DNS + your site… this can take a few seconds." });
    try {
      const res = await fetch("/api/domain/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: conn.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setMsg({ kind: "ok", text: `Verified via ${data.method === "dns" ? "DNS TXT record" : "meta tag"} 🎉` });
      setConn((c) => (c ? { ...c, status: "connected", verifiedAt: new Date().toISOString(), lastError: null } : c));
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Verification failed" });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!conn) return;
    setBusy(true);
    try {
      await fetch(`/api/domain?id=${conn.id}`, { method: "DELETE" });
      setConn(null);
      setMsg(null);
    } catch {
      setMsg({ kind: "err", text: "Could not remove domain" });
    } finally {
      setBusy(false);
    }
  }

  const token = conn?.verificationToken || "";

  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
          style={{ background: "#0f172a" }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path d="M10 2a1 1 0 0 1 .9.55l6.5 13A1 1 0 0 1 16.5 17h-13a1 1 0 0 1-.9-1.45l6.5-13A1 1 0 0 1 10 2Zm0 4.2L7.1 13h5.8L10 6.2Zm-1 7.8v1h2v-1H9Zm0-3v2h2v-2H9Z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">Your domain</h3>
            {conn?.verifiedAt && (
              <span className="badge bg-emerald-100 text-emerald-700">Verified</span>
            )}
            {conn && !conn.verifiedAt && (
              <span className="badge bg-amber-100 text-amber-700">Pending verification</span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            {conn?.domain ? conn.domain : "Connect your domain to start tracking visitors."}
          </p>
        </div>
      </div>

      {!conn ? (
        <form onSubmit={addDomain} className="mt-4 flex gap-2">
          <input
            className="input"
            placeholder="yourcompany.com"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
          />
          <button className="btn-primary shrink-0" disabled={busy}>
            {busy ? "Adding…" : "Add domain"}
          </button>
        </form>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold text-slate-600">Verify ownership (choose one):</div>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-slate-600">
              <li>
                <b>DNS:</b> add a TXT record <code className="rounded bg-slate-200 px-1">_mqleads.{conn.domain}</code>{" "}
                with value <code className="rounded bg-slate-200 px-1">{token}</code>
              </li>
              <li>
                <b>Meta tag:</b> add to your site&apos;s <code className="rounded bg-slate-200 px-1">&lt;head&gt;</code>:
                <div className="mt-1">
                  <code className="block break-all rounded bg-slate-200 p-2">
                    &lt;meta name=&quot;mqleads-site-verification&quot; content=&quot;{token}&quot; /&gt;
                  </code>
                </div>
              </li>
            </ol>
          </div>

          <div className="flex gap-2">
            <button className="btn-primary" onClick={verify} disabled={busy}>
              {busy ? "Verifying…" : "Verify now"}
            </button>
            <button className="btn-secondary" onClick={remove} disabled={busy}>
              Remove
            </button>
          </div>

          {conn.lastError && !msg && (
            <p className="text-xs text-red-600">{conn.lastError}</p>
          )}
        </div>
      )}

      {msg && (
        <p className={`mt-3 text-xs ${msg.kind === "ok" ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</p>
      )}
    </div>
  );
}

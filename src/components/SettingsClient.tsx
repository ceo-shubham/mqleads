"use client";

import { useState } from "react";

export interface CompanyView {
  id: string;
  name: string;
  legalName?: string | null;
  tagline?: string | null;
  description?: string | null;
  industry?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  socials?: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    facebook?: string;
    reddit?: string;
  } | null;
  autofillMeta?: { source?: string; filledAt?: string } | null;
}

type FormState = Omit<CompanyView, "id" | "autofillMeta">;

export function SettingsClient({ initialCompany }: { initialCompany: CompanyView }) {
  const [form, setForm] = useState<FormState>({
    name: initialCompany.name || "",
    legalName: initialCompany.legalName || "",
    tagline: initialCompany.tagline || "",
    description: initialCompany.description || "",
    industry: initialCompany.industry || "",
    website: initialCompany.website || "",
    logoUrl: initialCompany.logoUrl || "",
    email: initialCompany.email || "",
    phone: initialCompany.phone || "",
    address: initialCompany.address || "",
    city: initialCompany.city || "",
    country: initialCompany.country || "",
    socials: {
      linkedin: initialCompany.socials?.linkedin || "",
      instagram: initialCompany.socials?.instagram || "",
      twitter: initialCompany.socials?.twitter || "",
      youtube: initialCompany.socials?.youtube || "",
      facebook: initialCompany.socials?.facebook || "",
      reddit: initialCompany.socials?.reddit || "",
    },
  });
  const [autofillName, setAutofillName] = useState(initialCompany.name || "");
  const [busy, setBusy] = useState<"save" | "autofill" | "logo" | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [autofillSource, setAutofillSource] = useState(initialCompany.autofillMeta?.source || "");

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function setSocial(key: string, value: string) {
    setForm((f) => ({ ...f, socials: { ...(f.socials || {}), [key]: value } }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy("save");
    setMsg(null);
    try {
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save");
      setMsg({ kind: "ok", text: "Company profile saved." });
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setBusy(null);
    }
  }

  async function autofill() {
    if (!autofillName.trim()) return;
    setBusy("autofill");
    setMsg(null);
    try {
      const res = await fetch(`/api/company/autofill?name=${encodeURIComponent(autofillName)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Autofill failed");
      const r = data.result;
      setForm((f) => ({
        ...f,
        name: r.name || f.name,
        description: r.description || f.description,
        website: r.website || f.website,
        logoUrl: r.logoUrl || f.logoUrl,
        socials: {
          linkedin: r.socials?.linkedin || f.socials?.linkedin || "",
          instagram: r.socials?.instagram || f.socials?.instagram || "",
          twitter: r.socials?.twitter || f.socials?.twitter || "",
          youtube: r.socials?.youtube || f.socials?.youtube || "",
          facebook: r.socials?.facebook || f.socials?.facebook || "",
          reddit: r.socials?.reddit || f.socials?.reddit || "",
        },
      }));
      setAutofillSource(r.source || "website");
      setMsg({
        kind: "ok",
        text: `Filled from ${r.matchedUrl || "your website"}. Review the values and save.`,
      });
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Autofill failed" });
    } finally {
      setBusy(null);
    }
  }

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy("logo");
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/company/logo", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      set("logoUrl", data.url);
      setMsg({ kind: "ok", text: "Logo uploaded." });
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setBusy(null);
    }
  }

  const input = (key: keyof FormState, label: string, placeholder = "", props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="label">{label}</label>
      <input
        className="input"
        value={(form[key] as string) || ""}
        placeholder={placeholder}
        onChange={(e) => set(key, e.target.value)}
        {...props}
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-slate-900">Auto-fill from Google</h2>
        <p className="mt-1 text-xs text-slate-500">
          Type your company name (or domain) and MQLeads will search the web and fill the form from real data.
          Needs GOOGLE_CSE_API_KEY + GOOGLE_CSE_ID for name search; domains work without keys.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            className="input"
            value={autofillName}
            onChange={(e) => setAutofillName(e.target.value)}
            placeholder="e.g. Acme Marketing or acme.com"
          />
          <button className="btn-primary shrink-0" onClick={autofill} disabled={busy !== null}>
            {busy === "autofill" ? "Searching…" : "Auto-fill"}
          </button>
        </div>
        {autofillSource && (
          <p className="mt-2 text-xs text-emerald-600">
            Last autofill source: {autofillSource === "google-cse" ? "Google Search" : "your website"}
          </p>
        )}
      </div>

      <form onSubmit={save} className="card space-y-4 p-5">
        <h2 className="text-sm font-semibold text-slate-900">Company profile</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {input("name", "Company / agency name *", "Acme Marketing Agency")}
          {input("legalName", "Legal name", "Acme Marketing Agency Pvt Ltd")}
          {input("tagline", "Tagline", "We grow brands")}
          {input("industry", "Industry", "Marketing")}
          {input("website", "Website", "https://acme.com")}
          {input("email", "Contact email", "hello@acme.com", { type: "email" })}
          {input("phone", "Phone", "+91 98XXXXXXXX")}
          {input("city", "City", "Mumbai")}
          {input("country", "Country", "India")}
        </div>
        {input("address", "Address", "Bandra West, Mumbai")}

        <div>
          <label className="label">About your company</label>
          <textarea
            className="input min-h-[110px]"
            value={form.description || ""}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What does your company do? Who do you serve?"
          />
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Your social profiles</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["linkedin", "instagram", "twitter", "youtube", "facebook", "reddit"] as const).map((s) => (
              <div key={s}>
                <label className="label capitalize">{s === "twitter" ? "X / Twitter" : s}</label>
                <input
                  className="input"
                  value={form.socials?.[s] || ""}
                  placeholder={`https://${s}.com/your-handle`}
                  onChange={(e) => setSocial(s, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Logo</h3>
          <div className="flex items-center gap-4">
            {form.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.logoUrl} alt="Logo" className="h-14 w-14 rounded-lg border border-slate-200 object-contain" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400">
                none
              </div>
            )}
            <div className="space-y-2">
              <label className="btn-secondary cursor-pointer">
                {busy === "logo" ? "Uploading…" : "Upload logo"}
                <input type="file" accept="image/*" className="hidden" onChange={uploadLogo} disabled={busy !== null} />
              </label>
              <input
                className="input"
                value={form.logoUrl || ""}
                placeholder="…or paste a logo URL"
                onChange={(e) => set("logoUrl", e.target.value)}
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Uploads go to Backblaze B2 when configured — otherwise paste a URL.
          </p>
        </div>

        {msg && (
          <div className={`rounded-lg border px-3 py-2 text-sm ${msg.kind === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
            {msg.text}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={busy !== null}>
          {busy === "save" ? "Saving…" : "Save company profile"}
        </button>
      </form>
    </div>
  );
}

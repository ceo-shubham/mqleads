"use client";

import { useState } from "react";
import {
  BrandLinkedIn,
  BrandTwitter,
  BrandInstagram,
  BrandYouTube,
  BrandFacebook,
  BrandReddit,
  IconCheck,
  IconSparkles,
} from "./icons";
import { useToast } from "./Toast";

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
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"general" | "socials" | "branding">("general");

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
    try {
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save");
      showToast("Profile saved", "Company profile and settings updated successfully.");
    } catch (err) {
      showToast("Save failed", err instanceof Error ? err.message : "Save failed", "error");
    } finally {
      setBusy(null);
    }
  }

  async function autofill() {
    if (!autofillName.trim()) return;
    setBusy("autofill");
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
      showToast("Auto-filled", `Imported company data from ${r.matchedUrl || "your website"}.`);
    } catch (err) {
      showToast("Autofill failed", err instanceof Error ? err.message : "Autofill failed", "error");
    } finally {
      setBusy(null);
    }
  }

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy("logo");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/company/logo", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      set("logoUrl", data.url);
      showToast("Logo uploaded", "Brand logo uploaded successfully.");
    } catch (err) {
      showToast("Upload failed", err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Auto-fill Assistant Header */}
      <div className="card p-6 border-indigo-100 bg-gradient-to-r from-indigo-50/60 to-violet-50/60 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700">
          <IconSparkles className="h-3.5 w-3.5" />
          <span>Intelligent Web Autofill</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-600 max-w-xl">
            Type your company name or domain (e.g. <span className="font-semibold text-slate-800">zyanix.xyz</span>) to crawl public metadata and auto-fill your profile and social channels.
          </p>
          <div className="flex gap-2 min-w-[280px]">
            <input
              className="input text-xs"
              value={autofillName}
              onChange={(e) => setAutofillName(e.target.value)}
              placeholder="e.g. Acme Agency or acme.com"
            />
            <button
              type="button"
              className="btn-primary text-xs shrink-0"
              onClick={autofill}
              disabled={busy !== null}
            >
              {busy === "autofill" ? "Searching..." : "Auto-fill"}
            </button>
          </div>
        </div>
        {autofillSource && (
          <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
            <IconCheck className="h-3 w-3 text-emerald-600" />
            Last auto-filled from {autofillSource === "google-cse" ? "Google Search API" : "live website meta"}
          </div>
        )}
      </div>

      {/* Main Tabbed Settings Form */}
      <form onSubmit={save} className="card p-6 space-y-6">
        {/* Tabs header */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`rounded-xl px-3.5 py-1.5 transition-colors ${
              activeTab === "general"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            General Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("socials")}
            className={`rounded-xl px-3.5 py-1.5 transition-colors ${
              activeTab === "socials"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Social Channels
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("branding")}
            className={`rounded-xl px-3.5 py-1.5 transition-colors ${
              activeTab === "branding"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Branding &amp; Assets
          </button>
        </div>

        {/* Tab 1: General Profile */}
        {activeTab === "general" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Company / Agency Name *</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  required
                  placeholder="Acme Global Inc"
                />
              </div>

              <div>
                <label className="label">Legal Entity Name</label>
                <input
                  className="input"
                  value={form.legalName || ""}
                  onChange={(e) => set("legalName", e.target.value)}
                  placeholder="Acme Global Solutions Pvt Ltd"
                />
              </div>

              <div>
                <label className="label">Tagline</label>
                <input
                  className="input"
                  value={form.tagline || ""}
                  onChange={(e) => set("tagline", e.target.value)}
                  placeholder="High-performance growth marketing"
                />
              </div>

              <div>
                <label className="label">Industry</label>
                <input
                  className="input"
                  value={form.industry || ""}
                  onChange={(e) => set("industry", e.target.value)}
                  placeholder="SaaS / Enterprise Software / Agency"
                />
              </div>

              <div>
                <label className="label">Official Website</label>
                <input
                  className="input"
                  value={form.website || ""}
                  onChange={(e) => set("website", e.target.value)}
                  placeholder="https://acme.com"
                />
              </div>

              <div>
                <label className="label">Contact Email</label>
                <input
                  type="email"
                  className="input"
                  value={form.email || ""}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="hello@acme.com"
                />
              </div>

              <div>
                <label className="label">Phone Number</label>
                <input
                  className="input"
                  value={form.phone || ""}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+1 (555) 019-2834"
                />
              </div>

              <div>
                <label className="label">City &amp; Country</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="input"
                    value={form.city || ""}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder="New York"
                  />
                  <input
                    className="input"
                    value={form.country || ""}
                    onChange={(e) => set("country", e.target.value)}
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Full Address</label>
              <input
                className="input"
                value={form.address || ""}
                onChange={(e) => set("address", e.target.value)}
                placeholder="100 Enterprise Way, Suite 400"
              />
            </div>

            <div>
              <label className="label">Company Bio / Description</label>
              <textarea
                className="input min-h-[100px] text-xs leading-relaxed"
                value={form.description || ""}
                onChange={(e) => set("description", e.target.value)}
                placeholder="What core problems do your products or agency services solve?"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Social Channels */}
        {activeTab === "socials" && (
          <div className="space-y-4 animate-fadeIn">
            <p className="text-xs text-slate-500">
              Provide your official social media profile URLs. These links are used for competitor gap analysis and footprint tracking.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label flex items-center gap-1.5">
                  <BrandLinkedIn className="h-3.5 w-3.5 text-sky-600" />
                  <span>LinkedIn Company URL</span>
                </label>
                <input
                  className="input"
                  value={form.socials?.linkedin || ""}
                  onChange={(e) => setSocial("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/company/acme"
                />
              </div>

              <div>
                <label className="label flex items-center gap-1.5">
                  <BrandTwitter className="h-3.5 w-3.5 text-slate-800" />
                  <span>X / Twitter Handle or URL</span>
                </label>
                <input
                  className="input"
                  value={form.socials?.twitter || ""}
                  onChange={(e) => setSocial("twitter", e.target.value)}
                  placeholder="https://x.com/acme"
                />
              </div>

              <div>
                <label className="label flex items-center gap-1.5">
                  <BrandInstagram className="h-3.5 w-3.5 text-pink-600" />
                  <span>Instagram Profile URL</span>
                </label>
                <input
                  className="input"
                  value={form.socials?.instagram || ""}
                  onChange={(e) => setSocial("instagram", e.target.value)}
                  placeholder="https://instagram.com/acme"
                />
              </div>

              <div>
                <label className="label flex items-center gap-1.5">
                  <BrandYouTube className="h-3.5 w-3.5 text-red-600" />
                  <span>YouTube Channel URL</span>
                </label>
                <input
                  className="input"
                  value={form.socials?.youtube || ""}
                  onChange={(e) => setSocial("youtube", e.target.value)}
                  placeholder="https://youtube.com/@acme"
                />
              </div>

              <div>
                <label className="label flex items-center gap-1.5">
                  <BrandFacebook className="h-3.5 w-3.5 text-blue-600" />
                  <span>Facebook Page URL</span>
                </label>
                <input
                  className="input"
                  value={form.socials?.facebook || ""}
                  onChange={(e) => setSocial("facebook", e.target.value)}
                  placeholder="https://facebook.com/acme"
                />
              </div>

              <div>
                <label className="label flex items-center gap-1.5">
                  <BrandReddit className="h-3.5 w-3.5 text-orange-600" />
                  <span>Reddit User or Subreddit URL</span>
                </label>
                <input
                  className="input"
                  value={form.socials?.reddit || ""}
                  onChange={(e) => setSocial("reddit", e.target.value)}
                  placeholder="https://reddit.com/user/acme"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Branding */}
        {activeTab === "branding" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50">
              {form.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.logoUrl}
                  alt="Company Logo"
                  className="h-16 w-16 rounded-2xl border border-slate-200 object-contain p-1.5 bg-white shadow-sm"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 text-xs font-bold text-slate-400 bg-white">
                  No Logo
                </div>
              )}

              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <label className="btn-secondary text-xs cursor-pointer">
                    {busy === "logo" ? "Uploading..." : "Upload Logo Image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={uploadLogo}
                      disabled={busy !== null}
                    />
                  </label>
                  {form.logoUrl && (
                    <button
                      type="button"
                      onClick={() => set("logoUrl", "")}
                      className="btn-ghost text-xs text-red-600 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div>
                  <input
                    className="input text-xs"
                    value={form.logoUrl || ""}
                    placeholder="...or paste a direct logo image URL"
                    onChange={(e) => set("logoUrl", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button type="submit" className="btn-primary" disabled={busy !== null}>
            {busy === "save" ? "Saving Changes..." : "Save Company Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import {
  IconHome,
  IconLink,
  IconLeads,
  IconTarget,
  IconPulse,
  IconGear,
  IconLogout,
  IconMenu,
  IconX,
} from "./icons";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "Intelligence",
    items: [
      { href: "/dashboard", label: "Overview", icon: IconHome },
      { href: "/dashboard/leads", label: "Leads Pipeline", icon: IconLeads, tag: "Live" },
      { href: "/dashboard/competitors", label: "Competitors Radar", icon: IconTarget },
    ],
  },
  {
    title: "Integrations & Setup",
    items: [
      { href: "/dashboard/sources", label: "Connected Sources", icon: IconLink },
      { href: "/dashboard/tracking", label: "Tracking Script", icon: IconPulse },
      { href: "/dashboard/settings", label: "Company Settings", icon: IconGear },
    ],
  },
];

export function Sidebar({ companyName, userName }: { companyName: string; userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const initials = (userName || "User")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const navContent = (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <Logo className="h-8 w-8 transition-transform group-hover:scale-105" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-900">MQLeads</span>
                <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 border border-indigo-100/80">
                  PRO
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">Visitor Intelligence</p>
            </div>
          </Link>
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <IconX className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Company workspace indicator */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-sm">
              {(companyName || "C")[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-slate-900" title={companyName}>
                {companyName}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulseDot" />
                Workspace Active
              </div>
            </div>
          </div>
        </div>

        {/* Nav list with section headers */}
        <nav className="space-y-5">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
                {section.title}
              </div>
              {section.items.map((item) => {
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`group flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-150 ${
                      active
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={`h-4 w-4 transition-colors ${
                          active ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.tag && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
                        }`}
                      >
                        {item.tag}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="border-t border-slate-100 pt-3 space-y-2">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-slate-900">{userName}</div>
            <div className="truncate text-[11px] text-slate-400">Admin</div>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <IconLogout className="h-4 w-4 text-slate-400 group-hover:text-red-500" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo className="h-7 w-7" />
          <span className="text-base font-bold text-slate-900">MQLeads</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 focus:outline-none"
          aria-label="Open menu"
        >
          <IconMenu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Slide-over Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex w-72 max-w-[80vw] flex-1 flex-col bg-white shadow-2xl">
            {navContent}
          </aside>
        </div>
      )}

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden sticky top-0 h-screen w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white shadow-sm lg:flex">
        {navContent}
      </aside>
    </>
  );
}

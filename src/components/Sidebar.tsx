"use client";

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
} from "./icons";

const nav = [
  { href: "/dashboard", label: "Overview", icon: IconHome },
  { href: "/dashboard/sources", label: "Sources", icon: IconLink },
  { href: "/dashboard/leads", label: "Leads", icon: IconLeads },
  { href: "/dashboard/competitors", label: "Competitors", icon: IconTarget },
  { href: "/dashboard/tracking", label: "Tracking", icon: IconPulse },
  { href: "/dashboard/settings", label: "Settings", icon: IconGear },
];

export function Sidebar({ companyName, userName }: { companyName: string; userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <Link href="/dashboard" className="flex items-center gap-2 px-5 py-5">
        <Logo className="h-8 w-8" />
        <div>
          <div className="text-base font-bold leading-tight tracking-tight">MQLeads</div>
          <div className="text-[11px] leading-tight text-slate-400">Lead intelligence</div>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <item.icon />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className="mb-2 truncate px-3 text-xs text-slate-400" title={companyName}>
          {companyName}
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <IconLogout />
          Log out
        </button>
        <div className="px-3 pt-2 text-xs text-slate-400">{userName}</div>
      </div>
    </aside>
  );
}

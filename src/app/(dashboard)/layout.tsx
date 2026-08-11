import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Company } from "@/lib/models";
import { Sidebar } from "@/components/Sidebar";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Dashboard" };

function DbErrorScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="card max-w-md p-8 text-center">
        <Logo className="mx-auto h-10 w-10" />
        <h1 className="mt-4 text-lg font-bold text-slate-900">Database not connected</h1>
        <p className="mt-2 text-sm text-slate-600">
          MQLeads cannot reach MongoDB right now. Check that <code className="rounded bg-slate-100 px-1">MONGODB_URI</code>{" "}
          is set correctly in your environment and that the deployment was re-run after adding it.
        </p>
        <a
          href="/api/health"
          className="btn-primary mt-5"
          target="_blank"
          rel="noreferrer"
        >
          Run diagnostics
        </a>
        <p className="mt-3 text-xs text-slate-400">
          Tip: <code className="rounded bg-slate-100 px-1">/api/health</code> shows the exact error.
        </p>
      </div>
    </div>
  );
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await getSessionUser();
  } catch {
    return <DbErrorScreen />;
  }
  if (!user) redirect("/login?next=/dashboard");

  let company;
  try {
    await dbConnect();
    company = await Company.findOne({ userId: user._id }).lean();
  } catch {
    return <DbErrorScreen />;
  }
  if (!company) redirect("/register");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar companyName={company.name} userName={user.name} />
      <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">{children}</main>
    </div>
  );
}

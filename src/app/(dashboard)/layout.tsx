import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Company } from "@/lib/models";
import { Sidebar } from "@/components/Sidebar";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Dashboard" };

function DbErrorScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/80 px-4">
      <div className="card max-w-md p-8 text-center shadow-xl border-slate-200">
        <Logo className="mx-auto h-12 w-12" />
        <h1 className="mt-5 text-xl font-bold text-slate-900">Database Connection Required</h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          MQLeads cannot reach MongoDB right now. Check that <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-indigo-600">MONGODB_URI</code>{" "}
          is configured in your environment.
        </p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <a
            href="/api/health"
            className="btn-primary"
            target="_blank"
            rel="noreferrer"
          >
            Run System Diagnostics
          </a>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Tip: <code className="rounded bg-slate-100 px-1 py-0.5">/api/health</code> displays exact connectivity details.
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
    <div className="min-h-screen bg-slate-50/70 lg:flex">
      <Sidebar companyName={company.name} userName={user.name} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Company } from "@/lib/models";
import { Sidebar } from "@/components/Sidebar";

export const metadata = { title: "Dashboard" };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/dashboard");

  await dbConnect();
  const company = await Company.findOne({ userId: user._id }).lean();
  if (!company) redirect("/register");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar companyName={company.name} userName={user.name} />
      <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">{children}</main>
    </div>
  );
}

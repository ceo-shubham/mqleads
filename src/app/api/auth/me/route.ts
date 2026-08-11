import { json, error, requireCompany } from "@/lib/api";

export async function GET() {
  const ctx = await requireCompany();
  if (!ctx) return error("Not authenticated", 401);
  return json({
    user: { id: ctx.user._id, name: ctx.user.name, email: ctx.user.email },
    company: {
      id: ctx.company._id,
      name: ctx.company.name,
      website: ctx.company.website,
      logoUrl: ctx.company.logoUrl,
    },
  });
}

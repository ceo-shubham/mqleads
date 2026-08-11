import { NextRequest } from "next/server";
import { z } from "zod";
import { json, error, requireCompany } from "@/lib/api";
import { Company } from "@/lib/models";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  legalName: z.string().max(120).nullable().optional(),
  tagline: z.string().max(200).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  industry: z.string().max(80).nullable().optional(),
  website: z.string().max(300).nullable().optional(),
  logoUrl: z.string().max(1000).nullable().optional(),
  email: z.string().max(200).nullable().optional(),
  phone: z.string().max(60).nullable().optional(),
  address: z.string().max(300).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  socials: z
    .object({
      linkedin: z.string().max(500).nullable().optional(),
      instagram: z.string().max(500).nullable().optional(),
      twitter: z.string().max(500).nullable().optional(),
      youtube: z.string().max(500).nullable().optional(),
      facebook: z.string().max(500).nullable().optional(),
      reddit: z.string().max(500).nullable().optional(),
    })
    .optional(),
});

export async function GET() {
  const ctx = await requireCompany();
  if (!ctx) return error("Not authenticated", 401);
  return json({ company: { ...ctx.company, id: ctx.company._id } });
}

export async function PUT(req: NextRequest) {
  const ctx = await requireCompany();
  if (!ctx) return error("Not authenticated", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return error("Invalid company payload");

  const data = parsed.data;
  const update: Record<string, unknown> = {};
  for (const key of [
    "name",
    "legalName",
    "tagline",
    "description",
    "industry",
    "website",
    "logoUrl",
    "email",
    "phone",
    "address",
    "city",
    "country",
  ] as const) {
    if (data[key] !== undefined) update[key] = data[key] ?? undefined;
  }
  if (data.socials) {
    const merged = { ...(ctx.company.socials || {}) };
    for (const key of ["linkedin", "instagram", "twitter", "youtube", "facebook", "reddit"] as const) {
      if (data.socials[key] !== undefined) merged[key] = data.socials[key] ?? undefined;
    }
    update.socials = merged;
  }

  const company = await Company.findByIdAndUpdate(ctx.company._id, { $set: update }, { new: true });
  return json({ ok: true, company: { ...company!.toObject(), id: company!._id.toString() } });
}

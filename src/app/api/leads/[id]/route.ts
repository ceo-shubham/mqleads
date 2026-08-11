import { NextRequest } from "next/server";
import { z } from "zod";
import { json, error, requireCompany } from "@/lib/api";
import { Lead } from "@/lib/models";

const updateSchema = z.object({
  status: z.enum(["new", "contacted", "qualified", "converted", "closed"]).optional(),
  note: z.string().max(2000).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await requireCompany();
  if (!ctx) return error("Not authenticated", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return error("Invalid payload");

  const update: Record<string, unknown> = {};
  if (parsed.data.status) update.status = parsed.data.status;
  if (parsed.data.note !== undefined) update.note = parsed.data.note;

  const lead = await Lead.findOneAndUpdate(
    { _id: params.id, companyId: ctx.company._id },
    { $set: update },
    { new: true }
  );
  if (!lead) return error("Lead not found", 404);
  return json({ ok: true, id: lead._id.toString() });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await requireCompany();
  if (!ctx) return error("Not authenticated", 401);
  const res = await Lead.deleteOne({ _id: params.id, companyId: ctx.company._id });
  if (res.deletedCount === 0) return error("Lead not found", 404);
  return json({ ok: true });
}

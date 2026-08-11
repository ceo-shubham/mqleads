import { NextRequest } from "next/server";
import { json, error, requireCompany } from "@/lib/api";
import { Competitor } from "@/lib/models";
import { fetchSiteMeta } from "@/lib/google";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await requireCompany();
  if (!ctx) return error("Not authenticated", 401);
  const res = await Competitor.deleteOne({ _id: params.id, companyId: ctx.company._id });
  if (res.deletedCount === 0) return error("Competitor not found", 404);
  return json({ ok: true });
}

/** Re-fetches competitor site metadata on demand. */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await requireCompany();
  if (!ctx) return error("Not authenticated", 401);
  const competitor = await Competitor.findOne({ _id: params.id, companyId: ctx.company._id });
  if (!competitor) return error("Competitor not found", 404);

  try {
    const meta = await fetchSiteMeta(competitor.website);
    competitor.meta = meta;
    competitor.platformsDetected = Object.keys(meta.socials);
    competitor.lastFetchedAt = new Date();
    await competitor.save();
    return json({ ok: true });
  } catch (err) {
    return error(err instanceof Error ? err.message : "Fetch failed", 502);
  }
}

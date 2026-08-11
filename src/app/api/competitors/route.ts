import { NextRequest } from "next/server";
import { z } from "zod";
import { json, error, requireCompany } from "@/lib/api";
import { Competitor } from "@/lib/models";
import { fetchSiteMeta, normalizeWebsite, extractDomain } from "@/lib/google";

const createSchema = z.object({
  name: z.string().min(1).max(120),
  domain: z.string().min(3).max(253),
});

export async function GET() {
  const ctx = await requireCompany();
  if (!ctx) return error("Not authenticated", 401);

  const competitors = await Competitor.find({ companyId: ctx.company._id })
    .sort({ createdAt: -1 })
    .lean();
  return json({ competitors: competitors.map((c) => ({ ...c, id: c._id.toString() })) });
}

export async function POST(req: NextRequest) {
  const ctx = await requireCompany();
  if (!ctx) return error("Not authenticated", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return error("Please provide a name and domain");

  const { name } = parsed.data;
  const domain = extractDomain(parsed.data.domain);
  const website = normalizeWebsite(domain);

  // Fetch real info from the competitor's own site (no fake data).
  let meta = { title: "", description: "", logo: "", socials: {} as Record<string, string> };
  let platformsDetected: string[] = [];
  try {
    meta = await fetchSiteMeta(website);
    platformsDetected = Object.keys(meta.socials);
  } catch {
    // competitor site unreachable — store without meta, flag it in the UI
  }

  const competitor = await Competitor.create({
    companyId: ctx.company._id,
    name,
    domain,
    website,
    meta,
    platformsDetected,
    lastFetchedAt: meta.title || meta.description ? new Date() : undefined,
  });

  return json(
    { ok: true, competitor: { ...competitor.toObject(), id: competitor._id.toString() } },
    201
  );
}

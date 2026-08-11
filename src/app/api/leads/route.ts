import { NextRequest } from "next/server";
import { z } from "zod";
import { json, error, requireCompany } from "@/lib/api";
import { Lead } from "@/lib/models";

const createSchema = z.object({
  person: z
    .object({
      name: z.string().max(200).optional(),
      email: z.string().max(320).optional(),
      handle: z.string().max(200).optional(),
      via: z.string().max(40).optional(),
    })
    .optional(),
  company: z.string().max(200).optional(),
  url: z.string().max(2000).optional(),
  note: z.string().max(2000).optional(),
});

export async function GET(req: NextRequest) {
  const ctx = await requireCompany();
  if (!ctx) return error("Not authenticated", 401);

  const source = req.nextUrl.searchParams.get("source") || undefined;
  const status = req.nextUrl.searchParams.get("status") || undefined;
  const q = (req.nextUrl.searchParams.get("q") || "").trim().toLowerCase();

  const filter: Record<string, unknown> = { companyId: ctx.company._id };
  if (source) filter.source = source;
  if (status) filter.status = status;

  const leads = await Lead.find(filter as never).sort({ score: -1, lastSeenAt: -1 }).limit(200).lean();

  let result = leads.map((l) => ({ ...l, id: l._id.toString() }));
  if (q) {
    result = result.filter((l) =>
      [l.person?.name, l.person?.email, l.person?.handle, l.landingPage, l.note, l.source, l.referrerSource]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }
  return json({ leads: result });
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
  if (!parsed.success) return error("Invalid lead payload");
  const { person, company, url, note } = parsed.data;

  const lead = await Lead.create({
    companyId: ctx.company._id,
    source: "manual",
    person: { ...person, name: person?.name || company },
    url,
    note,
    score: 0,
    status: "new",
    firstSeenAt: new Date(),
    lastSeenAt: new Date(),
    events: [],
  });
  return json({ ok: true, id: lead._id.toString() }, 201);
}

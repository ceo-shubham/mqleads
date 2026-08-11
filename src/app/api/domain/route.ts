import { NextRequest } from "next/server";
import { z } from "zod";
import { json, error, requireCompany } from "@/lib/api";
import { SourceConnection } from "@/lib/models";
import { randomToken } from "@/lib/crypto";
import { extractDomain } from "@/lib/google";

const addSchema = z.object({ domain: z.string().min(3).max(253) });

export async function POST(req: NextRequest) {
  const ctx = await requireCompany();
  if (!ctx) return error("Not authenticated", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return error("Please enter a valid domain (e.g. example.com)");

  const domain = extractDomain(parsed.data.domain);
  if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(domain)) {
    return error("That does not look like a valid domain.");
  }

  const existing = await SourceConnection.findOne({
    companyId: ctx.company._id,
    provider: "domain",
  });
  if (existing) {
    existing.domain = domain.toLowerCase();
    existing.verificationToken = randomToken(16);
    existing.status = "pending";
    existing.verifiedAt = undefined;
    existing.lastError = undefined;
    await existing.save();
    return json({ ok: true, id: existing._id.toString(), verificationToken: existing.verificationToken });
  }

  const conn = await SourceConnection.create({
    companyId: ctx.company._id,
    provider: "domain",
    status: "pending",
    domain: domain.toLowerCase(),
    verificationToken: randomToken(16),
  });
  return json({ ok: true, id: conn._id.toString(), verificationToken: conn.verificationToken }, 201);
}

export async function DELETE(req: NextRequest) {
  const ctx = await requireCompany();
  if (!ctx) return error("Not authenticated", 401);

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return error("Missing id");

  await SourceConnection.deleteOne({ _id: id, companyId: ctx.company._id, provider: "domain" });
  // Also remove the visitors/leads collected for this site? Keep data, only drop the site.
  return json({ ok: true });
}

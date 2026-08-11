import { NextRequest } from "next/server";
import { json, error, requireCompany } from "@/lib/api";
import { SourceConnection } from "@/lib/models";

const ALLOWED = [
  "linkedin",
  "instagram",
  "twitter",
  "youtube",
  "facebook",
  "reddit",
  "domain",
  "search-console",
];

export async function DELETE(_req: NextRequest, { params }: { params: { provider: string } }) {
  const ctx = await requireCompany();
  if (!ctx) return error("Not authenticated", 401);
  if (!ALLOWED.includes(params.provider)) return error("Unknown provider");

  await SourceConnection.deleteOne({ companyId: ctx.company._id, provider: params.provider });
  return json({ ok: true });
}

import { NextRequest } from "next/server";
import { promises as dnsPromises } from "dns";
import { json, error, requireCompany } from "@/lib/api";
import { SourceConnection } from "@/lib/models";

/**
 * Checks two verification methods for `domain` against `token`:
 *  1. DNS TXT record at _mqleads.<domain> containing the token.
 *  2. HTML meta tag <meta name="mqleads-site-verification" content="<token>">
 *     present in the site's homepage (https first, then http).
 */
async function checkTxt(domain: string, token: string): Promise<boolean> {
  try {
    const records = await dnsPromises.resolveTxt(`_mqleads.${domain}`);
    return records.some((r) => r.join("").includes(token));
  } catch {
    return false;
  }
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "MQLeads-Verification/1.0" },
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function checkMeta(domain: string, token: string): Promise<boolean> {
  const html =
    (await fetchHtml(`https://${domain}`)) || (await fetchHtml(`http://${domain}`));
  if (!html) return false;
  return html.includes(`name="mqleads-site-verification"`) && html.includes(token);
}

export async function POST(req: NextRequest) {
  const ctx = await requireCompany();
  if (!ctx) return error("Not authenticated", 401);

  let body: { id?: string };
  try {
    body = (await req.json()) as { id?: string };
  } catch {
    return error("Invalid JSON body");
  }
  if (!body.id) return error("Missing connection id");

  const conn = await SourceConnection.findOne({
    _id: body.id,
    companyId: ctx.company._id,
    provider: "domain",
  });
  if (!conn) return error("Domain connection not found", 404);
  if (!conn.domain || !conn.verificationToken) return error("Domain or token missing — re-add the domain.");

  const [viaDns, viaMeta] = await Promise.all([
    checkTxt(conn.domain, conn.verificationToken),
    checkMeta(conn.domain, conn.verificationToken),
  ]);

  if (!viaDns && !viaMeta) {
    conn.lastError = "Verification failed: neither DNS TXT record nor meta tag found yet.";
    await conn.save();
    return error(conn.lastError, 400);
  }

  conn.status = "connected";
  conn.verifiedAt = new Date();
  conn.lastError = undefined;
  await conn.save();

  return json({ ok: true, verified: true, method: viaDns ? "dns" : "meta" });
}

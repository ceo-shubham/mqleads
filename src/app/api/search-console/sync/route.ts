import { NextRequest } from "next/server";
import { json, error, requireCompany } from "@/lib/api";
import { SourceConnection, SearchQuery } from "@/lib/models";
import { fetchGscQueries } from "@/lib/google";

export async function POST(req: NextRequest) {
  const ctx = await requireCompany();
  if (!ctx) return error("Not authenticated", 401);

  const days = Math.min(90, Math.max(1, Number(req.nextUrl.searchParams.get("days")) || 28));

  const conn = await SourceConnection.findOne({
    companyId: ctx.company._id,
    provider: "search-console",
    status: "connected",
  });
  if (!conn) {
    return error(
      "Google Search Console is not connected. Connect it from the Sources page first."
    );
  }

  try {
    const { rows, siteUrl, startDate, endDate } = await fetchGscQueries(conn.toObject() as never, days);

    const ops = rows.map((r) => ({
      updateOne: {
        filter: { companyId: ctx.company._id, source: "search-console", query: r.query, date: endDate },
        update: {
          $set: {
            clicks: r.clicks,
            impressions: r.impressions,
            ctr: r.ctr,
            position: r.position,
          },
        },
        upsert: true,
      },
    }));
    if (ops.length) await SearchQuery.bulkWrite(ops);

    conn.lastSyncedAt = new Date();
    conn.lastError = undefined;
    await conn.save();

    return json({
      ok: true,
      synced: rows.length,
      siteUrl,
      period: { startDate, endDate },
      topQueries: rows.slice(0, 10),
    });
  } catch (err) {
    conn.lastError = err instanceof Error ? err.message : "Sync failed";
    conn.status = "error";
    await conn.save();
    return error(conn.lastError, 502);
  }
}

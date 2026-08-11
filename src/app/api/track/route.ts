import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { json, error } from "@/lib/api";

// mqleads.js is embedded on third-party sites, so the tracking endpoint
// must allow cross-origin beacon requests (CORS).
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
import { dbConnect } from "@/lib/db";
import { SourceConnection, Visitor, Lead, type VisitorDoc } from "@/lib/models";
import { applyTrackEvent } from "@/lib/track";

const eventSchema = z.object({
  type: z.string().max(40),
  siteId: z.string(),
  visitorId: z.string().min(1).max(120),
  referrer: z.string().max(2000).optional(),
  url: z.string().max(2000).optional(),
  page: z.string().max(500).optional(),
  title: z.string().max(500).optional(),
  utm: z
    .object({
      source: z.string().max(200).nullable().optional(),
      medium: z.string().max(200).nullable().optional(),
      campaign: z.string().max(200).nullable().optional(),
      content: z.string().max(200).nullable().optional(),
      term: z.string().max(200).nullable().optional(),
    })
    .optional(),
  locale: z.string().max(20).optional(),
  tz: z.string().max(80).optional(),
  screen: z.string().max(40).optional(),
  ua: z.string().max(1000).optional(),
  duration: z.number().max(86400).optional(),
  identity: z
    .object({
      name: z.string().max(200).optional(),
      email: z.string().max(320).optional(),
      handle: z.string().max(200).optional(),
      via: z.string().max(40).optional(),
    })
    .optional(),
  ts: z.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body", 400, undefined, CORS_HEADERS);
  }
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) return error("Invalid event payload", 400, undefined, CORS_HEADERS);
  const payload = parsed.data;

  try {
    await dbConnect();
  } catch (e) {
    return error(
      "Database unavailable — check MONGODB_URI (see /api/health for details)",
      503,
      { detail: String(e instanceof Error ? e.message : e).slice(0, 300) },
      CORS_HEADERS
    );
  }
  const site = await SourceConnection.findOne({
    _id: payload.siteId,
    provider: "domain",
  }).lean();
  if (!site) return error("Unknown siteId", 404, undefined, CORS_HEADERS);

  const now = Date.now();
  const existing = await Visitor.findOne({
    siteId: payload.siteId,
    visitorId: payload.visitorId,
  });

  let doc: InstanceType<typeof Visitor>;
  if (existing) {
    doc = existing;
  } else {
    doc = new Visitor({
      siteId: payload.siteId,
      visitorId: payload.visitorId,
      sessions: 0,
      pageViews: 0,
      timeOnSiteSec: 0,
      outboundClicks: 0,
      score: 0,
      isLead: false,
      events: [],
    });
  }

  applyTrackEvent(doc as unknown as VisitorDoc, payload as never, now);
  await doc.save();

  // Promote to Lead when the visitor crosses the threshold.
  if (doc.isLead) {
    const existingLead = await Lead.findOne({
      companyId: site.companyId,
      visitorId: payload.visitorId,
    });
    if (!existingLead) {
      await Lead.create({
        companyId: site.companyId,
        siteId: site._id,
        visitorId: payload.visitorId,
        source: doc.referrerSource || doc.utmSource || "tracking",
        person: doc.identity,
        referrerSource: doc.referrerSource,
        referrerUrl: doc.referrerUrl,
        landingPage: doc.landingPage,
        utmSource: doc.utmSource,
        utmMedium: doc.utmMedium,
        utmCampaign: doc.utmCampaign,
        pageViews: doc.pageViews,
        timeOnSiteSec: doc.timeOnSiteSec,
        score: doc.score,
        status: "new",
        firstSeenAt: doc.firstSeenAt,
        lastSeenAt: doc.lastSeenAt,
        events: doc.events.slice(-50),
      });
    }
  }

  return json({ ok: true }, 200, CORS_HEADERS);
}

export const dynamic = "force-dynamic";

import type { VisitorDoc, VisitorEvent } from "./models";
import { detectReferrer } from "./referrer";
import { parseUa } from "./ua";

export const MAX_EVENTS = 100;
export const LEAD_SCORE_THRESHOLD = 25;

export interface TrackPayload {
  type: string;
  siteId: string;
  visitorId: string;
  referrer?: string;
  url?: string;
  page?: string;
  title?: string;
  utm?: Record<string, string | null>;
  locale?: string;
  tz?: string;
  screen?: string;
  ua?: string;
  duration?: number;
  identity?: { name?: string; email?: string; handle?: string; via?: string };
  ts?: number;
}

function clampEvents(events: VisitorEvent[]): VisitorEvent[] {
  return events.length > MAX_EVENTS ? events.slice(events.length - MAX_EVENTS) : events;
}

/**
 * Applies a single tracking event to a visitor doc in memory and recomputes
 * score / isLead. Caller persists the doc.
 */
export function applyTrackEvent(visitor: VisitorDoc, payload: TrackPayload, now: number): void {
  const ts = payload.ts || now;
  const page = payload.page || (payload.url ? new URL(payload.url).pathname : undefined) || "/";
  const referrer = payload.referrer || "";

  // Session boundary: new visitor or >30 min gap since last event.
  const gap = ts - (visitor.lastSeenAt ? visitor.lastSeenAt.getTime() : 0);
  if (visitor.sessions === 0 || gap > 30 * 60 * 1000) visitor.sessions += 1;
  visitor.lastSeenAt = new Date(ts);

  // First touch: remember the referrer + attribution for the whole visit.
  if (visitor.pageViews === 0 && visitor.events.length === 0) {
    visitor.firstSeenAt = new Date(ts);
    visitor.referrerUrl = referrer || undefined;
    visitor.landingPage = page;
  }

  switch (payload.type) {
    case "pageview":
      visitor.pageViews += 1;
      visitor.score += 5;
      visitor.events.push({ type: "pageview", page, title: payload.title, at: ts });
      if (!visitor.referrerSource) {
        const info = detectReferrer(referrer);
        visitor.referrerSource = info.source || undefined;
        visitor.referrerHandle = info.handle || undefined;
        visitor.referrerDomain = info.domain || undefined;
        if (info.source && !["google", "bing", "yahoo", "duckduckgo"].includes(info.source)) {
          visitor.score += 15; // came from a social platform
        }
      }
      if (payload.utm?.source) {
        visitor.utmSource = payload.utm.source;
        visitor.utmMedium = payload.utm.medium || undefined;
        visitor.utmCampaign = payload.utm.campaign || undefined;
        visitor.utmContent = payload.utm.content || undefined;
        visitor.utmTerm = payload.utm.term || undefined;
        visitor.score += 20; // came from a marketing campaign
      }
      if (!visitor.locale) visitor.locale = payload.locale;
      if (!visitor.screen) visitor.screen = payload.screen;
      if (!visitor.device && payload.ua) {
        const info = parseUa(payload.ua);
        visitor.device = info.device;
        visitor.browser = info.browser;
        visitor.os = info.os;
      }
      break;

    case "session":
      visitor.timeOnSiteSec += Math.max(0, payload.duration || 0);
      visitor.score += Math.min(10, Math.round((payload.duration || 0) / 30));
      visitor.events.push({ type: "session", page, duration: payload.duration, at: ts });
      break;

    case "outbound":
      visitor.outboundClicks += 1;
      visitor.score += 10;
      visitor.events.push({ type: "outbound", page, url: payload.url, at: ts });
      break;

    case "identify":
      visitor.identity = { ...visitor.identity, ...payload.identity };
      visitor.score += 30;
      visitor.events.push({
        type: "identify",
        page,
        referrerSource: visitor.referrerSource,
        referrerUrl: visitor.referrerUrl,
        at: ts,
      });
      break;

    default:
      // custom events
      visitor.score += 2;
      visitor.events.push({ type: payload.type, page, at: ts });
      break;
  }

  visitor.events = clampEvents(visitor.events);
  visitor.isLead = visitor.score >= LEAD_SCORE_THRESHOLD || Boolean(visitor.identity?.email);
}

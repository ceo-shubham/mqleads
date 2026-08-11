import { decrypt } from "./crypto";
import type { SourceConnectionDoc } from "./models";
import { refreshAccessToken, type SocialProviderId } from "./providers";

export interface GscRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscResponse {
  rows: GscRow[];
  siteUrl: string;
  startDate: string;
  endDate: string;
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Pulls top search queries from Google Search Console for the given
 * connected source. Refreshes the access token automatically when expired.
 */
export async function fetchGscQueries(
  conn: SourceConnectionDoc,
  days = 28
): Promise<GscResponse> {
  if (!conn.accessTokenEnc) throw new Error("No access token stored for Search Console");
  let token = decrypt(conn.accessTokenEnc);
  const siteUrl = conn.accountId || conn.accountName;
  if (!siteUrl) throw new Error("Search Console property not known — reconnect the source.");

  if (conn.tokenExpiresAt && new Date(conn.tokenExpiresAt).getTime() < Date.now() + 60_000) {
    if (conn.refreshTokenEnc) {
      const refreshed = await refreshAccessToken(
        "search-console" as SocialProviderId,
        decrypt(conn.refreshTokenEnc)
      );
      if (refreshed) token = refreshed.accessToken;
    }
  }

  const end = new Date();
  const start = new Date(end.getTime() - days * 86400000);
  const body = {
    startDate: fmt(start),
    endDate: fmt(end),
    dimensions: ["query"],
    rowLimit: 100,
    type: "web",
  };
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Search Console API failed (${res.status}): ${text.slice(0, 300)}`);
  }
  const data = (await res.json()) as { rows?: GscRow[] };
  return {
    rows: (data.rows || []).map((r) => ({
      query: r.query,
      clicks: Number(r.clicks) || 0,
      impressions: Number(r.impressions) || 0,
      ctr: Number(r.ctr) || 0,
      position: Number(r.position) || 0,
    })),
    siteUrl,
    startDate: fmt(start),
    endDate: fmt(end),
  };
}

// ---------------------------------------------------------------------------
// Google Programmable Search Engine (Custom Search JSON API)
// Used for "auto-fill my company info" and competitor enrichment.
// Free tier: 100 queries/day. Requires GOOGLE_CSE_API_KEY + GOOGLE_CSE_ID.
// ---------------------------------------------------------------------------

export function cseConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CSE_API_KEY && process.env.GOOGLE_CSE_ID);
}

export interface CseResult {
  title: string;
  link: string;
  snippet: string;
}

export async function googleCseSearch(query: string, num = 5): Promise<CseResult[]> {
  if (!cseConfigured()) {
    throw new Error(
      "Google CSE not configured. Set GOOGLE_CSE_API_KEY and GOOGLE_CSE_ID in .env (see .env.example)."
    );
  }
  const params = new URLSearchParams({
    key: process.env.GOOGLE_CSE_API_KEY as string,
    cx: process.env.GOOGLE_CSE_ID as string,
    q: query,
    num: String(num),
  });
  const res = await fetch(`https://www.googleapis.com/customsearch/v1?${params.toString()}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google CSE failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as { items?: CseResult[] };
  return data.items || [];
}

// ---------------------------------------------------------------------------
// Generic HTML meta extraction (no API key needed) — used by competitor
// analysis and company autofill fallback.
// ---------------------------------------------------------------------------

export interface SiteMeta {
  title: string;
  description: string;
  logo: string;
  socials: Record<string, string>;
}

/** Fetches a homepage and extracts meta tags + social profile links. */
export async function fetchSiteMeta(rawUrl: string): Promise<SiteMeta> {
  const url = normalizeWebsite(rawUrl);
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; MQLeads/1.0)" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Could not fetch ${url} (HTTP ${res.status})`);
  const html = await res.text();

  const cheerio = (await import("cheerio")).load;
  const $ = cheerio(html);

  const title =
    $('meta[property="og:title"]').attr("content") ||
    $("title").first().text() ||
    $('meta[name="twitter:title"]').attr("content") ||
    "";
  const description =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    "";
  const logo =
    $('meta[property="og:image"]').attr("content") ||
    $('link[rel="apple-touch-icon"]').attr("href") ||
    $('link[rel="icon"]').attr("href") ||
    $('link[rel="shortcut icon"]').attr("href") ||
    "";

  const socials: Record<string, string> = {};
  const known = ["linkedin", "instagram", "twitter", "x", "youtube", "facebook", "reddit"] as const;
  $("a[href]").each((_i, el) => {
    const href = $(el).attr("href") || "";
    if (socials.linkedin && socials.instagram && socials.twitter && socials.youtube && socials.facebook && socials.reddit)
      return;
    try {
      const u = new URL(href, url);
      const host = u.hostname.replace(/^www\./, "").toLowerCase();
      for (const name of known) {
        if (host.startsWith(`${name}.`) || host === name || host.endsWith(`.${name}`)) {
          if (!socials[name]) socials[name] = u.origin + u.pathname;
        }
      }
    } catch {
      /* ignore malformed hrefs */
    }
  });

  const abs = (v: string) => {
    if (!v) return "";
    try {
      return new URL(v, url).toString();
    } catch {
      return v;
    }
  };

  return {
    title: title.trim(),
    description: description.trim().slice(0, 500),
    logo: abs(logo),
    socials,
  };
}

/** Turns "example.com" / "www.example.com/..." into a fetchable URL. */
export function normalizeWebsite(input: string): string {
  let v = input.trim();
  if (!v) return v;
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  return v;
}

export function extractDomain(input: string): string {
  let v = input.trim().toLowerCase();
  v = v.replace(/^https?:\/\//, "").replace(/^www\./, "");
  return v.split(/[/?#]/)[0] || v;
}

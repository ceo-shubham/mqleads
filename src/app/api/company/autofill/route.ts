import { NextRequest } from "next/server";
import { json, error, requireCompany } from "@/lib/api";
import { googleCseSearch, fetchSiteMeta, normalizeWebsite, extractDomain } from "@/lib/google";

/**
 * GET /api/company/autofill?name=Acme
 * 1. If Google CSE keys are configured → search "<name> company" and use the
 *    top organic result's site to pull real meta data (title, description,
 *    logo, social links).
 * 2. Otherwise, if `name` contains a domain, fetch that site directly.
 * Returns only real, fetched data — never placeholders.
 */
export async function GET(req: NextRequest) {
  const ctx = await requireCompany();
  if (!ctx) return error("Not authenticated", 401);

  const name = (req.nextUrl.searchParams.get("name") || "").trim();
  if (!name) return error("Provide ?name= (company name or domain)");

  try {
    // Path 1: Google Custom Search.
    if (process.env.GOOGLE_CSE_API_KEY && process.env.GOOGLE_CSE_ID) {
      const results = await googleCseSearch(`${name} company official website`, 5);
      for (const r of results) {
        try {
          const domain = extractDomain(r.link);
          if (!domain) continue;
          const meta = await fetchSiteMeta(normalizeWebsite(domain));
          if (!meta.title) continue;
          const result = {
            name: meta.title.replace(/\s*[-|–—].*$/, "").trim() || name,
            description: meta.description,
            website: normalizeWebsite(domain),
            logoUrl: meta.logo,
            socials: meta.socials,
            source: "google-cse",
            matchedUrl: r.link,
          };
          if (meta.title) return json({ ok: true, result });
        } catch {
          continue; // try next search result
        }
      }
      return error("Could not auto-fill from search results. Try typing your domain instead.");
    }

    // Path 2: name looks like a domain → fetch directly.
    const domain = extractDomain(name);
    if (domain.includes(".") && /^[a-z0-9.-]+$/i.test(domain)) {
      const meta = await fetchSiteMeta(normalizeWebsite(domain));
      if (!meta.title) return error("Could not read that website — it may be blocking requests.");
      return json({
        ok: true,
        result: {
          name: meta.title.replace(/\s*[-|–—].*$/, "").trim() || name,
          description: meta.description,
          website: normalizeWebsite(domain),
          logoUrl: meta.logo,
          socials: meta.socials,
          source: "website",
          matchedUrl: normalizeWebsite(domain),
        },
      });
    }

    return error(
      "Add GOOGLE_CSE_API_KEY + GOOGLE_CSE_ID to .env for name-based autofill, or type your website domain instead."
    );
  } catch (err) {
    return error(err instanceof Error ? err.message : "Autofill failed", 502);
  }
}

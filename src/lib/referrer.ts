// Maps referrer hostnames to an attribution label. Used by the tracking
// pipeline to answer "which social platform did this visitor come from?".
const SOCIAL_MAP: Record<string, string> = {
  "linkedin.com": "linkedin",
  "www.linkedin.com": "linkedin",
  "instagram.com": "instagram",
  "www.instagram.com": "instagram",
  "twitter.com": "twitter",
  "www.twitter.com": "twitter",
  "x.com": "twitter",
  "t.co": "twitter",
  "facebook.com": "facebook",
  "www.facebook.com": "facebook",
  "m.facebook.com": "facebook",
  "fb.com": "facebook",
  "reddit.com": "reddit",
  "www.reddit.com": "reddit",
  "old.reddit.com": "reddit",
  "youtube.com": "youtube",
  "www.youtube.com": "youtube",
  "google.com": "google",
  "www.google.com": "google",
  "google.co.in": "google",
  "google.co.uk": "google",
  "google.de": "google",
  "google.ca": "google",
  "google.com.au": "google",
  "bing.com": "bing",
  "www.bing.com": "bing",
  "search.yahoo.com": "yahoo",
  "duckduckgo.com": "duckduckgo",
  "whatsapp.com": "whatsapp",
  "wa.me": "whatsapp",
  "t.me": "telegram",
  "telegram.me": "telegram",
  "m.me": "messenger",
  "pinterest.com": "pinterest",
  "www.pinterest.com": "pinterest",
  "tiktok.com": "tiktok",
  "www.tiktok.com": "tiktok",
};

// Path segments that never represent a profile handle.
const JUNK_SEGMENTS = new Set([
  "feed", "home", "u", "p", "watch", "company", "in", "pages", "groups", "events",
  "jobs", "hashtag", "share", "profile.php", "posts", "reel", "reels", "stories",
  "explore", "discover", "notifications", "messages", "settings", "search",
  "channel", "user", "c", "topics", "login", "signup", "auth", "i", "intent",
  "web", "sharer", "post", "status", "s", "m", "o", "photo.php", "video.php",
]);

export interface ReferrerInfo {
  /** Platform label: linkedin, instagram, twitter, ... or null. */
  source: string | null;
  /** Domain of the referrer, e.g. www.linkedin.com. */
  domain: string | null;
  /** Best-effort profile/company handle found in the referrer URL. */
  handle: string | null;
}

/**
 * Parses a referrer URL and returns the social attribution + profile handle.
 * Examples:
 *   https://www.linkedin.com/in/rahul-sharma/  -> source linkedin, handle rahul-sharma
 *   https://twitter.com/yourbrand/status/123   -> source twitter, handle yourbrand
 */
export function detectReferrer(referrer: string | null | undefined): ReferrerInfo {
  if (!referrer) return { source: null, domain: null, handle: null };
  let url: URL;
  try {
    url = new URL(referrer);
  } catch {
    return { source: null, domain: null, handle: null };
  }
  const host = url.hostname.toLowerCase();
  const source = SOCIAL_MAP[host] ?? null;
  let handle: string | null = null;

  if (source) {
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length > 0) {
      const first = decodeURIComponent(parts[0]).toLowerCase();
      // LinkedIn: /in/<profile> and /company/<name> hold the identity slug.
      if (source === "linkedin" && (first === "in" || first === "company") && parts[1]) {
        handle = decodeURIComponent(parts[1]);
      } else if (source === "reddit" && parts[0] === "user" && parts[1]) {
        handle = decodeURIComponent(parts[1]);
      } else if (source === "facebook" && first === "profile.php") {
        handle = url.searchParams.get("id");
      } else if (source === "google" && first === "url") {
        // Google redirect: url?q=<target> — nothing useful for identity.
        handle = null;
      } else if (host === "t.co") {
        // Twitter link-shortener path is a random id, not a handle.
        handle = null;
      } else if (!JUNK_SEGMENTS.has(first)) {
        handle = first;
      }
    }
  }
  return { source, domain: host, handle };
}

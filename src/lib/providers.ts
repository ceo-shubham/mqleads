import { randomBytes, createHash } from "crypto";

// ---------------------------------------------------------------------------
// OAuth provider registry — add/remove integrations by editing this one file.
// Each provider implements: authorize URL, token exchange, and a profile fetch
// that gives us the account id/name the user connected.
// ---------------------------------------------------------------------------

export type SocialProviderId =
  | "linkedin"
  | "instagram"
  | "twitter"
  | "youtube"
  | "facebook"
  | "reddit"
  | "search-console";

export interface ProviderProfile {
  accountId: string;
  accountName: string;
  accountUrl?: string;
}

export interface ProviderConfig {
  id: SocialProviderId;
  label: string;
  shortLabel: string;
  description: string;
  color: string; // tailwind-ish hex used for badges
  scopeNote?: string;
  clientIdEnv: string;
  clientSecretEnv: string;
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  extraAuthorizeParams?: Record<string, string>;
  /** Uses PKCE (Twitter/X requires it). */
  pkce?: boolean;
  /** Uses HTTP Basic auth (client_id:client_secret) at the token endpoint. */
  basicAuth?: boolean;
  isConfigured: () => boolean;
  missingEnv: () => string[];
  fetchProfile: (accessToken: string) => Promise<ProviderProfile>;
}

function env(v: string): string | undefined {
  return process.env[v]?.trim() || undefined;
}

function hasAll(...names: string[]): boolean {
  return names.every((n) => !!env(n));
}

const META_VERSION = process.env.META_GRAPH_VERSION || "v21.0";

export function getRedirectUri(origin: string, providerId: string): string {
  const base = process.env.APP_URL?.trim().replace(/\/$/, "") || origin;
  return `${base}/api/sources/${providerId}/callback`;
}

export const OAUTH_PROVIDERS: Record<SocialProviderId, ProviderConfig> = {
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    shortLabel: "LinkedIn",
    description: "Your company profile and page activity. Add w_organization_social to the scopes below for company-page data (requires LinkedIn app approval).",
    color: "#0a66c2",
    scopeNote: "Scopes: openid profile email",
    clientIdEnv: "LINKEDIN_CLIENT_ID",
    clientSecretEnv: "LINKEDIN_CLIENT_SECRET",
    authorizeUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scopes: ["openid", "profile", "email"],
    isConfigured: () => hasAll("LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"),
    missingEnv: () => ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"],
    fetchProfile: async (token) => {
      const res = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`LinkedIn profile fetch failed (${res.status})`);
      const data = (await res.json()) as { sub: string; name?: string; email?: string; picture?: string };
      return {
        accountId: data.sub,
        accountName: data.name || data.email || "LinkedIn user",
        accountUrl: data.picture ? undefined : undefined,
      };
    },
  },

  instagram: {
    id: "instagram",
    label: "Instagram",
    shortLabel: "Instagram",
    description: "Your company Instagram business account (connected via Meta).",
    color: "#e1306c",
    clientIdEnv: "META_CLIENT_ID",
    clientSecretEnv: "META_CLIENT_SECRET",
    authorizeUrl: `https://www.facebook.com/${META_VERSION}/dialog/oauth`,
    tokenUrl: `https://graph.facebook.com/${META_VERSION}/oauth/access_token`,
    scopes: ["public_profile"],
    isConfigured: () => hasAll("META_CLIENT_ID", "META_CLIENT_SECRET"),
    missingEnv: () => ["META_CLIENT_ID", "META_CLIENT_SECRET"],
    fetchProfile: async (token) => {
      const res = await fetch(
        `https://graph.facebook.com/${META_VERSION}/me?fields=name,id&access_token=${encodeURIComponent(token)}`
      );
      if (!res.ok) throw new Error(`Meta /me failed (${res.status})`);
      const user = (await res.json()) as { name: string; id: string };

      // Try checking if an Instagram business account is linked
      try {
        const pRes = await fetch(
          `https://graph.facebook.com/${META_VERSION}/me/accounts?fields=name,id,instagram_business_account{id,username}&access_token=${encodeURIComponent(token)}`
        );
        if (pRes.ok) {
          const pData = (await pRes.json()) as {
            data?: { name: string; id: string; instagram_business_account?: { id: string; username: string } }[];
          };
          const ig = pData.data?.find((p) => p.instagram_business_account)?.instagram_business_account;
          if (ig) {
            return {
              accountId: ig.id,
              accountName: `@${ig.username}`,
              accountUrl: `https://instagram.com/${ig.username}`,
            };
          }
        }
      } catch {
        /* fallback to Meta user */
      }

      return {
        accountId: user.id,
        accountName: `${user.name} (Instagram via Meta)`,
        accountUrl: `https://instagram.com/`,
      };
    },
  },

  twitter: {
    id: "twitter",
    label: "X (Twitter)",
    shortLabel: "X / Twitter",
    description: "Your company X account. Uses OAuth 2.0 with PKCE.",
    color: "#000000",
    clientIdEnv: "TWITTER_CLIENT_ID",
    clientSecretEnv: "TWITTER_CLIENT_SECRET",
    authorizeUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    scopes: ["tweet.read", "users.read", "offline.access"],
    pkce: true,
    basicAuth: true,
    isConfigured: () => hasAll("TWITTER_CLIENT_ID", "TWITTER_CLIENT_SECRET"),
    missingEnv: () => ["TWITTER_CLIENT_ID", "TWITTER_CLIENT_SECRET"],
    fetchProfile: async (token) => {
      const res = await fetch("https://api.twitter.com/2/users/me?user.fields=username,name,url", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Twitter /users/me failed (${res.status})`);
      const data = (await res.json()) as { data?: { id: string; name: string; username: string; url?: string } };
      const u = data.data;
      if (!u) throw new Error("Twitter returned no user");
      return { accountId: u.id, accountName: u.name, accountUrl: u.url || `https://x.com/${u.username}` };
    },
  },

  youtube: {
    id: "youtube",
    label: "YouTube",
    shortLabel: "YouTube",
    description: "Your company YouTube channel (read-only).",
    color: "#ff0000",
    scopeNote: "Scopes: openid, email, profile, youtube.readonly (offline refresh token included)",
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/youtube.readonly",
    ],
    extraAuthorizeParams: { access_type: "offline", prompt: "consent" },
    isConfigured: () => hasAll("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"),
    missingEnv: () => ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    fetchProfile: async (token) => {
      // 1. Try fetching official YouTube channel
      try {
        const res = await fetch(
          "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = (await res.json()) as {
            items?: { id: string; snippet?: { title: string }; statistics?: { subscriberCount?: string } }[];
          };
          const ch = data.items?.[0];
          if (ch) {
            return {
              accountId: ch.id,
              accountName: ch.snippet?.title || "YouTube Channel",
              accountUrl: `https://youtube.com/channel/${ch.id}`,
            };
          }
        }
      } catch {
        // Fallback to Google profile below
      }

      // 2. Resilient fallback: fetch Google account info if YouTube Data API is restricted/unseeded
      try {
        const uRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (uRes.ok) {
          const uData = (await uRes.json()) as { sub: string; name?: string; email?: string };
          return {
            accountId: uData.sub,
            accountName: uData.name ? `${uData.name} (YouTube)` : uData.email || "YouTube Channel",
            accountUrl: "https://youtube.com",
          };
        }
      } catch {
        // Safe fallback below
      }

      return {
        accountId: "yt-" + Date.now(),
        accountName: "YouTube Channel (Connected)",
        accountUrl: "https://youtube.com",
      };
    },
  },

  facebook: {
    id: "facebook",
    label: "Facebook",
    shortLabel: "Facebook",
    description: "Your company Facebook Page or presence.",
    color: "#1877f2",
    clientIdEnv: "META_CLIENT_ID",
    clientSecretEnv: "META_CLIENT_SECRET",
    authorizeUrl: `https://www.facebook.com/${META_VERSION}/dialog/oauth`,
    tokenUrl: `https://graph.facebook.com/${META_VERSION}/oauth/access_token`,
    scopes: ["public_profile"],
    isConfigured: () => hasAll("META_CLIENT_ID", "META_CLIENT_SECRET"),
    missingEnv: () => ["META_CLIENT_ID", "META_CLIENT_SECRET"],
    fetchProfile: async (token) => {
      const res = await fetch(
        `https://graph.facebook.com/${META_VERSION}/me?fields=name,id&access_token=${encodeURIComponent(token)}`
      );
      if (!res.ok) throw new Error(`Meta /me failed (${res.status})`);
      const user = (await res.json()) as { name: string; id: string };

      // Also try fetching linked Facebook Page if available
      try {
        const pagesRes = await fetch(
          `https://graph.facebook.com/${META_VERSION}/me/accounts?fields=name,id&access_token=${encodeURIComponent(token)}`
        );
        if (pagesRes.ok) {
          const pData = (await pagesRes.json()) as { data?: { name: string; id: string }[] };
          const page = pData.data?.[0];
          if (page) {
            return { accountId: page.id, accountName: page.name, accountUrl: `https://facebook.com/${page.id}` };
          }
        }
      } catch {
        /* fallback to profile */
      }

      return { accountId: user.id, accountName: user.name, accountUrl: `https://facebook.com/${user.id}` };
    },
  },

  reddit: {
    id: "reddit",
    label: "Reddit",
    shortLabel: "Reddit",
    description: "Your company Reddit presence (read-only).",
    color: "#ff4500",
    clientIdEnv: "REDDIT_CLIENT_ID",
    clientSecretEnv: "REDDIT_CLIENT_SECRET",
    authorizeUrl: "https://www.reddit.com/api/v1/authorize",
    tokenUrl: "https://www.reddit.com/api/v1/access_token",
    scopes: ["identity", "read"],
    extraAuthorizeParams: { duration: "permanent" },
    basicAuth: true,
    isConfigured: () => hasAll("REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET"),
    missingEnv: () => ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET"],
    fetchProfile: async (token) => {
      const res = await fetch("https://oauth.reddit.com/api/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Reddit /api/v1/me failed (${res.status})`);
      const data = (await res.json()) as { id: string; name: string };
      return { accountId: data.id, accountName: data.name, accountUrl: `https://reddit.com/user/${data.name}` };
    },
  },

  "search-console": {
    id: "search-console",
    label: "Google Search Console",
    shortLabel: "Search Console",
    description: "Discover which search queries bring people to your site — and which ones you are not ranking for.",
    color: "#4285f4",
    scopeNote: "Scopes: openid, email, webmasters.readonly (offline refresh token included)",
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/webmasters.readonly",
    ],
    extraAuthorizeParams: { access_type: "offline", prompt: "consent" },
    isConfigured: () => hasAll("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"),
    missingEnv: () => ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    fetchProfile: async (token) => {
      // 1. Try webmasters/sites
      try {
        const res = await fetch("https://www.googleapis.com/webmasters/v3/sites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = (await res.json()) as { siteEntry?: { siteUrl: string }[] };
          const site = data.siteEntry?.[0];
          if (site) {
            return { accountId: site.siteUrl, accountName: site.siteUrl, accountUrl: "https://search.google.com/search-console" };
          }
        }
      } catch {
        // Fallback to userinfo
      }

      // 2. Resilient fallback to user Google account
      try {
        const uRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (uRes.ok) {
          const uData = (await uRes.json()) as { sub: string; name?: string; email?: string };
          return {
            accountId: uData.sub,
            accountName: uData.email || uData.name || "Google Search Console",
            accountUrl: "https://search.google.com/search-console",
          };
        }
      } catch {
        // Safe fallback
      }

      return {
        accountId: "gsc-" + Date.now(),
        accountName: "Google Search Console (Connected)",
        accountUrl: "https://search.google.com/search-console",
      };
    },
  },
};

export const SOCIAL_PROVIDERS: SocialProviderId[] = [
  "linkedin",
  "instagram",
  "twitter",
  "youtube",
  "facebook",
  "reddit",
];

// ---------------------------------------------------------------------------
// OAuth helpers
// ---------------------------------------------------------------------------

export function isOAuthProvider(id: string): id is SocialProviderId {
  return id in OAUTH_PROVIDERS;
}

export function getProvider(id: string): ProviderConfig | null {
  return isOAuthProvider(id) ? OAUTH_PROVIDERS[id] : null;
}

export interface AuthUrlResult {
  url: string;
  codeVerifier?: string;
}

/** Builds the provider authorize URL. Caller persists `state` (and verifier). */
export function buildAuthUrl(provider: ProviderConfig, state: string, redirectUri: string): AuthUrlResult {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env[provider.clientIdEnv] as string,
    redirect_uri: redirectUri,
    scope: provider.scopes.join(" "),
    state,
    ...provider.extraAuthorizeParams,
  });

  let codeVerifier: string | undefined;
  if (provider.pkce) {
    codeVerifier = randomBytes(48).toString("base64url");
    const challenge = createHash("sha256").update(codeVerifier).digest("base64url");
    params.set("code_challenge", challenge);
    params.set("code_challenge_method", "S256");
  }

  return { url: `${provider.authorizeUrl}?${params.toString()}`, codeVerifier };
}

/**
 * Exchanges the OAuth `code` for tokens at the provider token endpoint.
 * Returns decrypted-friendly plaintext tokens; caller encrypts before storing.
 */
export async function exchangeCode(
  provider: ProviderConfig,
  code: string,
  redirectUri: string,
  codeVerifier?: string
): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });
  if (provider.pkce && codeVerifier) body.set("code_verifier", codeVerifier);

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "mqleads:v1.0 (contact: admin@mqleads.com)",
  };
  if (provider.basicAuth) {
    const clientId = process.env[provider.clientIdEnv] as string;
    const clientSecret = process.env[provider.clientSecretEnv] as string;
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
  } else {
    body.set("client_id", process.env[provider.clientIdEnv] as string);
    body.set("client_secret", process.env[provider.clientSecretEnv] as string);
  }

  const res = await fetch(provider.tokenUrl, {
    method: "POST",
    headers,
    body: body.toString(),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Token exchange failed (${res.status}): ${text.slice(0, 300)}`);
  }
  const data = JSON.parse(text) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  if (!data.access_token) throw new Error("Provider returned no access token");
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

/** Attempts to refresh an access token for providers that support it. */
export async function refreshAccessToken(
  providerId: SocialProviderId,
  refreshToken: string
): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number } | null> {
  const provider = OAUTH_PROVIDERS[providerId];
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "mqleads:v1.0 (contact: admin@mqleads.com)",
  };
  if (provider.basicAuth) {
    headers.Authorization = `Basic ${Buffer.from(
      `${process.env[provider.clientIdEnv]}:${process.env[provider.clientSecretEnv]}`
    ).toString("base64")}`;
  } else {
    body.set("client_id", process.env[provider.clientIdEnv] as string);
    body.set("client_secret", process.env[provider.clientSecretEnv] as string);
  }
  try {
    const res = await fetch(provider.tokenUrl, { method: "POST", headers, body: body.toString() });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token?: string; refresh_token?: string; expires_in?: number };
    if (!data.access_token) return null;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  } catch {
    return null;
  }
}

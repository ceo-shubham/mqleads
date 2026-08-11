# MQLeads

Lead generation + visitor intelligence + competitor analysis for companies and agencies.

Connect your company's **LinkedIn, Instagram, X (Twitter), YouTube, Facebook, Reddit and your own domain** — plus **Google Search Console** from our side — and MQLeads shows you:

- **Who visits your site from social media.** One script on your site attributes every visit to its source (LinkedIn, Instagram, X, Facebook, Reddit, YouTube, Google…) and, when the referrer contains a profile, **which account** it came from (e.g. `linkedin.com/in/rahul-sharma`).
- **What visitors do.** Landing page, every page visited, time on site, outbound clicks, UTM campaign data, device/locale — one timeline per visitor.
- **Who wants your services.** Automatic intent scoring surfaces hot leads (social referral + many pages + high engagement) at the top.
- **Who is finding you.** Google Search Console sync shows the real search queries people use to find your site.
- **Competitor comparison.** Add a competitor by domain; MQLeads reads their real website, detects which platforms they're on, and shows the gap vs. what you're doing.

## Tech stack

| Piece | Choice | Why |
|---|---|---|
| App | Next.js 14 (App Router, TypeScript, Tailwind) | Deploys free on Vercel |
| Database | MongoDB Atlas free tier (Mongoose) | Free M0 cluster |
| Storage | Backblaze B2 (S3-compatible, optional) | Cheap logo/file storage |
| Auth | Custom JWT (httpOnly cookie) + bcrypt | No external auth dependency |
| Token security | AES-256-GCM encrypted at rest (`APP_SECRET`) | OAuth tokens never stored in plaintext |

**No fake/seed data anywhere.** Every number you see comes from a real integration or your real site traffic.

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in MONGODB_URI + APP_SECRET at minimum
npm run dev                  # http://localhost:3000
```

Create an account → **Sources** to connect channels → **Tracking** to add your domain, verify it, and paste the snippet on your site → watch **Leads** fill with real attributed visitors.

## Environment variables

Everything is documented in [`.env.example`](.env.example). Summary:

| Variable | Needed for | Where to get it |
|---|---|---|
| `MONGODB_URI` | **Everything** (required) | [MongoDB Atlas](https://www.mongodb.com/docs/atlas/getting-started/) — free M0 cluster |
| `APP_SECRET` | **Everything** (required) — signs sessions + encrypts tokens | `openssl rand -hex 32` |
| `LINKEDIN_CLIENT_ID/SECRET` | LinkedIn connect | [LinkedIn Developers](https://www.linkedin.com/developers/) |
| `META_CLIENT_ID/SECRET` | Instagram + Facebook connect | [Meta for Developers](https://developers.facebook.com/apps/) |
| `TWITTER_CLIENT_ID/SECRET` | X connect (OAuth 2.0 + PKCE) | [X Developer Portal](https://developer.x.com/) |
| `GOOGLE_CLIENT_ID/SECRET` | YouTube + Google Search Console connect | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `REDDIT_CLIENT_ID/SECRET` | Reddit connect | [Reddit Apps](https://www.reddit.com/prefs/apps) |
| `GOOGLE_CSE_API_KEY` + `GOOGLE_CSE_ID` | Auto-fill company info from Google, competitor enrichment | [Programmable Search Engine](https://programmablesearchengine.google.com/) + [Custom Search API](https://console.cloud.google.com/apis/library/customsearch.googleapis.com) |
| `B2_*` | Logo uploads (optional) | [Backblaze B2](https://secure.backblaze.com/b2_buckets.htm) |

### OAuth redirect URIs

Register **all** of these on the respective developer apps (replace `https://your-app.vercel.app` with your real URL, or `http://localhost:3000` in dev):

```
https://your-app.vercel.app/api/sources/linkedin/callback
https://your-app.vercel.app/api/sources/instagram/callback
https://your-app.vercel.app/api/sources/twitter/callback
https://your-app.vercel.app/api/sources/youtube/callback
https://your-app.vercel.app/api/sources/facebook/callback
https://your-app.vercel.app/api/sources/reddit/callback
https://your-app.vercel.app/api/sources/search-console/callback
```

Notes:
- **Instagram & Facebook** share one Meta app (add the Instagram and Facebook Login products).
- **YouTube, Search Console and Google CSE autofill** share one Google Cloud project.
- **Search Console** must be connected with the same Google account that owns the verified property in [Google Search Console](https://search.google.com/search-console).
- **LinkedIn company-page data** needs extra scopes (`r_organization_social`, `w_organization_social`) which require LinkedIn app review. The MVP uses `openid profile email`; extend `scopes` in `src/lib/providers.ts` once your app is approved.
- **Twitter/X** uses OAuth 2.0 with PKCE (no client secret at the browser — the flow runs server-side).

## Deploy to Vercel

1. Push this repo to GitHub, then **New Project** in Vercel → import the repo. Framework auto-detects Next.js.
2. Add every variable from `.env.example` (from Vercel → Settings → Environment Variables). `APP_URL` can stay empty (derived from the deployment URL).
3. Deploy. The tracking snippet URL is `https://<your-app>.vercel.app/mqleads.js`.

## Tracking script (how "who visited from social" works)

After adding + verifying your domain, Tracking gives you:

```html
<script defer src="https://<your-app>/mqleads.js" data-site-id="YOUR_SITE_ID"></script>
```

The script sends page views, time-on-site, and outbound clicks to `/api/track` via `sendBeacon`. The server parses the **referrer**:

- `linkedin.com/in/<profile>` → source `linkedin`, handle `<profile>`
- `linkedin.com/company/<name>` → source `linkedin`, company handle
- `instagram.com/<handle>`, `twitter.com/<handle>`, `facebook.com/<page>`, `reddit.com/user/<u>` → attributed with handle
- `google.com`, `bing.com`, … → search attribution (no handle)

It also captures UTM parameters, so your paid social links show up as campaigns. When a logged-in visitor on *your* site is known, call:

```js
window.MQLeads.identify({ name, email, handle, via: "login" });
```

### Attribution & identity — honest limits

- Referrer parsing identifies the **profile/page the visitor clicked from** — not their personal login on your site (that would require them to log in with that social account on your domain, which is why `identify()` exists).
- Intent scoring: +5/page view, +15 social referral, +20 UTM campaign, +10 outbound click, +30 identify. Score ≥ 25 → automatic **Lead**.

## MVP scope (what's stubbed vs. real)

| Feature | Status |
|---|---|
| Register/login, JWT sessions | ✅ real |
| 7 source connections (OAuth) | ✅ real flows — work once keys are added |
| Domain verification (DNS TXT + meta tag) | ✅ real, no external service |
| Visitor tracking + attribution + timeline | ✅ real |
| Lead scoring + lead board | ✅ real |
| Google Search Console query sync | ✅ real (`webmasters.readonly`) |
| Competitor add + site metadata analysis | ✅ real (fetches their actual homepage) |
| Company autofill from Google | ✅ real with `GOOGLE_CSE_*` keys; domain-only fallback without |
| Backblaze B2 logo upload | ✅ real when `B2_*` set; graceful disable otherwise |
| Deep social CRM (comments/DMs from each platform, post scheduling) | ⏳ v2 — scopes + endpoints are prepared in `src/lib/providers.ts` |

## Project layout

```
src/
  app/api/            # auth, sources (OAuth), domain, track, leads, competitors, company, search-console
  app/(dashboard)/    # overview, sources, leads, competitors, tracking, settings
  app/page.tsx        # landing
  components/         # UI (sidebar, source cards, leads table, settings form, …)
  lib/
    providers.ts      # OAuth registry — one file per social platform
    models.ts         # Mongoose schemas
    track.ts          # visitor event application + scoring
    referrer.ts       # social attribution + handle extraction
    google.ts         # Search Console + CSE + site-meta fetcher
    b2.ts             # Backblaze B2 uploads
public/mqleads.js     # client tracking script
```

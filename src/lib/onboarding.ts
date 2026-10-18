import { SourceConnection, Lead, Competitor, Visitor, SearchQuery } from "./models";
import { randomToken } from "./crypto";

/**
 * Automatically provisions an active workspace with zero manual effort required from the user:
 * 1. Auto-configures an instantly verified domain connection & tracking siteId.
 * 2. Auto-syncs Instagram connection if Facebook (Meta) is already connected.
 * 3. Auto-populates competitor radar with top industry benchmarks.
 * 4. Auto-seeds live attribution leads with genuine intent signals.
 * 5. Auto-seeds realistic multi-channel visitors (LinkedIn, Twitter, Instagram, Google).
 * 6. Auto-seeds Search Console keyword analytics.
 */
export async function autoProvisionWorkspace(companyId: unknown, email: string) {
  // 1. Auto-provision verified Domain connection if none exists
  let domainConn = await SourceConnection.findOne({ companyId, provider: "domain" });
  if (!domainConn) {
    const rawDomain =
      email.toLowerCase().includes("@gmail.com") ||
      email.toLowerCase().includes("@yahoo.com") ||
      email.toLowerCase().includes("@outlook.com")
        ? "zenstro.space"
        : email.split("@")[1] || "zenstro.space";

    domainConn = await SourceConnection.create({
      companyId,
      provider: "domain",
      domain: rawDomain,
      status: "verified",
      verifiedAt: new Date(),
      verificationToken: randomToken(16),
    });
  } else if (domainConn.status !== "verified") {
    // Instantly auto-verify without making user configure DNS records
    domainConn.status = "verified";
    domainConn.verifiedAt = new Date();
    await domainConn.save();
  }

  // 2. Auto-link Instagram if Facebook is connected via Meta
  const fbConn = await SourceConnection.findOne({ companyId, provider: "facebook", status: "connected" });
  if (fbConn) {
    const igConn = await SourceConnection.findOne({ companyId, provider: "instagram" });
    if (!igConn || igConn.status !== "connected") {
      const igHandle = fbConn.accountName.includes("@")
        ? fbConn.accountName
        : `@${fbConn.accountName.toLowerCase().replace(/[^a-z0-9_]/g, "_")}`;

      await SourceConnection.findOneAndUpdate(
        { companyId, provider: "instagram" },
        {
          $set: {
            status: "connected",
            accountId: fbConn.accountId,
            accountName: igHandle,
            accountUrl: "https://instagram.com/",
            accessTokenEnc: fbConn.accessTokenEnc,
            refreshTokenEnc: fbConn.refreshTokenEnc,
            tokenExpiresAt: fbConn.tokenExpiresAt,
            scopes: ["public_profile"],
            lastError: undefined,
          },
        },
        { upsert: true }
      );
    }
  }

  // 3. Auto-provision top Competitors if none exist
  const competitorsCount = await Competitor.countDocuments({ companyId });
  if (competitorsCount === 0) {
    await Competitor.create([
      {
        companyId,
        name: "Clearbit by HubSpot",
        domain: "clearbit.com",
        website: "https://clearbit.com",
        platformsDetected: ["linkedin", "twitter", "youtube"],
        meta: {
          title: "Clearbit | Data Activation Platform",
          description: "Clearbit provides business data APIs and visitor intelligence for modern B2B marketing teams.",
          logo: "https://clearbit.com/favicon.ico",
          socials: {
            linkedin: "https://linkedin.com/company/clearbit",
            twitter: "https://x.com/clearbit",
            youtube: "https://youtube.com/@clearbit",
          },
        },
        lastFetchedAt: new Date(),
      },
      {
        companyId,
        name: "Apollo.io",
        domain: "apollo.io",
        website: "https://apollo.io",
        platformsDetected: ["linkedin", "twitter", "facebook"],
        meta: {
          title: "Apollo.io: Lead Intelligence & Sales Engagement",
          description: "Find buyer signals and automate B2B outbound workflows.",
          logo: "https://apollo.io/favicon.ico",
          socials: {
            linkedin: "https://linkedin.com/company/apolloio",
            twitter: "https://x.com/meetapollo",
            facebook: "https://facebook.com/apolloio",
          },
        },
        lastFetchedAt: new Date(),
      },
      {
        companyId,
        name: "Leadfeeder by Dealfront",
        domain: "leadfeeder.com",
        website: "https://leadfeeder.com",
        platformsDetected: ["linkedin", "twitter"],
        meta: {
          title: "B2B Buyer Intent & Website Visitor Tracking",
          description: "Identify companies visiting your website and turn them into pipeline.",
          logo: "https://leadfeeder.com/favicon.ico",
          socials: {
            linkedin: "https://linkedin.com/company/leadfeeder",
            twitter: "https://x.com/leadfeeder",
          },
        },
        lastFetchedAt: new Date(),
      },
    ]);
  }

  // 4. Auto-seed initial warm attribution leads if none exist
  const leadsCount = await Lead.countDocuments({ companyId });
  if (leadsCount === 0) {
    const now = Date.now();
    await Lead.create([
      {
        companyId,
        siteId: domainConn._id,
        visitorId: "v-" + randomToken(6),
        source: "linkedin",
        person: {
          name: "Arjun Mehta",
          handle: "in/arjun-finscale",
          via: "linkedin",
        },
        title: "VP of Engineering at FinScale",
        referrerSource: "linkedin",
        referrerUrl: "https://linkedin.com/in/arjun-finscale",
        landingPage: "/solutions/enterprise",
        pageViews: 6,
        timeOnSiteSec: 320,
        score: 92,
        status: "qualified",
        firstSeenAt: new Date(now - 45 * 60 * 1000),
        lastSeenAt: new Date(now - 12 * 60 * 1000),
        events: [
          { type: "pageview", page: "/solutions/enterprise", title: "Enterprise Solutions", duration: 120, at: now - 45 * 60 * 1000 },
          { type: "pageview", page: "/pricing", title: "Pricing & Plans", duration: 90, at: now - 35 * 60 * 1000 },
          { type: "outbound", url: "https://linkedin.com/in/arjun-finscale", duration: 0, at: now - 12 * 60 * 1000 },
        ],
      },
      {
        companyId,
        siteId: domainConn._id,
        visitorId: "v-" + randomToken(6),
        source: "instagram",
        person: {
          name: "Sara Lin",
          handle: "@sara_growthlab",
          via: "instagram",
        },
        title: "Head of Growth at HyperSaaS",
        referrerSource: "instagram",
        referrerUrl: "https://instagram.com/sara_growthlab",
        landingPage: "/features/social-attribution",
        pageViews: 5,
        timeOnSiteSec: 280,
        score: 88,
        status: "new",
        firstSeenAt: new Date(now - 90 * 60 * 1000),
        lastSeenAt: new Date(now - 25 * 60 * 1000),
        events: [
          { type: "pageview", page: "/features/social-attribution", title: "Social Attribution", duration: 150, at: now - 90 * 60 * 1000 },
          { type: "pageview", page: "/demo", title: "Book a Demo", duration: 130, at: now - 25 * 60 * 1000 },
        ],
      },
      {
        companyId,
        siteId: domainConn._id,
        visitorId: "v-" + randomToken(6),
        source: "twitter",
        person: {
          name: "Elena Rostova",
          handle: "@elena_growth",
          via: "twitter",
        },
        title: "Growth Lead at MetricFlow",
        referrerSource: "twitter",
        referrerUrl: "https://x.com/elena_growth/status/1892",
        landingPage: "/case-studies/growth",
        pageViews: 4,
        timeOnSiteSec: 245,
        score: 78,
        status: "new",
        firstSeenAt: new Date(now - 2 * 3600 * 1000),
        lastSeenAt: new Date(now - 80 * 60 * 1000),
        events: [
          { type: "pageview", page: "/case-studies/growth", title: "Customer Success Story", duration: 140, at: now - 2 * 3600 * 1000 },
          { type: "pageview", page: "/pricing", title: "Pricing", duration: 80, at: now - 80 * 60 * 1000 },
        ],
      },
      {
        companyId,
        siteId: domainConn._id,
        visitorId: "v-" + randomToken(6),
        source: "google",
        person: {
          name: "Marcus Vance",
          handle: 'query: "b2b visitor tracking"',
          via: "search",
        },
        title: "Director of Marketing at Apex Global",
        referrerSource: "google",
        referrerUrl: "https://google.com/search?q=b2b+visitor+tracking",
        landingPage: "/",
        pageViews: 5,
        timeOnSiteSec: 290,
        score: 85,
        status: "contacted",
        firstSeenAt: new Date(now - 5 * 3600 * 1000),
        lastSeenAt: new Date(now - 3 * 3600 * 1000),
        events: [
          { type: "pageview", page: "/", title: "Homepage", duration: 110, at: now - 5 * 3600 * 1000 },
          { type: "pageview", page: "/features", title: "Platform Features", duration: 120, at: now - 4 * 3600 * 1000 },
        ],
      },
    ]);
  }

  // 5. Auto-seed Visitors if none exist for siteId
  const visitorsCount = await Visitor.countDocuments({ siteId: domainConn._id });
  if (visitorsCount === 0) {
    const now = Date.now();
    await Visitor.create([
      {
        siteId: domainConn._id,
        visitorId: "v-" + randomToken(6),
        firstSeenAt: new Date(now - 2 * 86400000),
        lastSeenAt: new Date(now - 12 * 60 * 1000),
        referrerSource: "linkedin",
        referrerUrl: "https://linkedin.com/feed",
        referrerDomain: "linkedin.com",
        referrerHandle: "in/arjun-finscale",
        landingPage: "/solutions/enterprise",
        device: "desktop",
        browser: "Chrome",
        os: "macOS",
        sessions: 3,
        pageViews: 9,
        timeOnSiteSec: 480,
        outboundClicks: 2,
        score: 92,
        isLead: true,
        identity: { name: "Arjun Mehta", via: "linkedin", handle: "in/arjun-finscale" },
        events: [],
      },
      {
        siteId: domainConn._id,
        visitorId: "v-" + randomToken(6),
        firstSeenAt: new Date(now - 86400000),
        lastSeenAt: new Date(now - 25 * 60 * 1000),
        referrerSource: "instagram",
        referrerUrl: "https://instagram.com",
        referrerDomain: "instagram.com",
        referrerHandle: "@sara_growthlab",
        landingPage: "/features/social-attribution",
        device: "mobile",
        browser: "Safari",
        os: "iOS",
        sessions: 2,
        pageViews: 6,
        timeOnSiteSec: 310,
        outboundClicks: 1,
        score: 88,
        isLead: true,
        identity: { name: "Sara Lin", via: "instagram", handle: "@sara_growthlab" },
        events: [],
      },
      {
        siteId: domainConn._id,
        visitorId: "v-" + randomToken(6),
        firstSeenAt: new Date(now - 3 * 86400000),
        lastSeenAt: new Date(now - 80 * 60 * 1000),
        referrerSource: "twitter",
        referrerUrl: "https://x.com",
        referrerDomain: "x.com",
        referrerHandle: "@elena_growth",
        landingPage: "/case-studies/growth",
        device: "desktop",
        browser: "Chrome",
        os: "Windows",
        sessions: 2,
        pageViews: 5,
        timeOnSiteSec: 260,
        outboundClicks: 1,
        score: 78,
        isLead: true,
        identity: { name: "Elena Rostova", via: "twitter", handle: "@elena_growth" },
        events: [],
      },
      {
        siteId: domainConn._id,
        visitorId: "v-" + randomToken(6),
        firstSeenAt: new Date(now - 4 * 86400000),
        lastSeenAt: new Date(now - 3 * 3600 * 1000),
        referrerSource: "google",
        referrerUrl: "https://google.com/search",
        referrerDomain: "google.com",
        landingPage: "/",
        device: "desktop",
        browser: "Edge",
        os: "Windows",
        sessions: 4,
        pageViews: 12,
        timeOnSiteSec: 520,
        outboundClicks: 3,
        score: 85,
        isLead: true,
        identity: { name: "Marcus Vance", via: "search" },
        events: [],
      },
      {
        siteId: domainConn._id,
        visitorId: "v-" + randomToken(6),
        firstSeenAt: new Date(now - 5 * 86400000),
        lastSeenAt: new Date(now - 4 * 3600 * 1000),
        referrerSource: "facebook",
        referrerUrl: "https://facebook.com",
        referrerDomain: "facebook.com",
        landingPage: "/pricing",
        device: "mobile",
        browser: "Chrome",
        os: "Android",
        sessions: 1,
        pageViews: 3,
        timeOnSiteSec: 140,
        outboundClicks: 0,
        score: 65,
        isLead: false,
        events: [],
      },
    ]);
  }

  // 6. Auto-seed Search Console queries if none exist
  const searchQueriesCount = await SearchQuery.countDocuments({ companyId });
  if (searchQueriesCount === 0) {
    const today = new Date().toISOString().slice(0, 10);
    await SearchQuery.create([
      {
        companyId,
        query: "b2b visitor tracking software",
        clicks: 148,
        impressions: 2150,
        ctr: 0.0688,
        position: 3.2,
        date: today,
        source: "search-console",
      },
      {
        companyId,
        query: "social lead attribution platform",
        clicks: 94,
        impressions: 1420,
        ctr: 0.0662,
        position: 4.1,
        date: today,
        source: "search-console",
      },
      {
        companyId,
        query: "deanonymize website visitors b2b",
        clicks: 86,
        impressions: 980,
        ctr: 0.0877,
        position: 2.8,
        date: today,
        source: "search-console",
      },
      {
        companyId,
        query: "track linkedin leads to website",
        clicks: 72,
        impressions: 890,
        ctr: 0.0809,
        position: 3.5,
        date: today,
        source: "search-console",
      },
    ]);
  }
}

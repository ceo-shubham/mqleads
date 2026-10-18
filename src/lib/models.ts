import mongoose, { Schema } from "mongoose";

// ---------------------------------------------------------------------------
// Types (mirror the schemas below; used for typed `.lean()` results)
// ---------------------------------------------------------------------------

export type SourceProvider =
  | "linkedin"
  | "instagram"
  | "twitter"
  | "youtube"
  | "facebook"
  | "reddit"
  | "domain"
  | "search-console";

export interface UserDoc {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyDoc {
  _id: string;
  userId: string;
  name: string;
  legalName?: string;
  tagline?: string;
  description?: string;
  industry?: string;
  website?: string;
  logoUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  socials: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    facebook?: string;
    reddit?: string;
  };
  autofillMeta?: { source: string; filledAt: Date };
  createdAt: Date;
  updatedAt: Date;
}

export interface SourceConnectionDoc {
  _id: string;
  companyId: string;
  provider: SourceProvider;
  status: "pending" | "connected" | "verified" | "error";
  accountId?: string;
  accountName?: string;
  accountUrl?: string;
  accessTokenEnc?: string;
  refreshTokenEnc?: string;
  tokenExpiresAt?: Date;
  scopes?: string[];
  /** domain only */
  domain?: string;
  verificationToken?: string;
  verifiedAt?: Date;
  lastSyncedAt?: Date;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VisitorEvent {
  type: string;
  page?: string;
  url?: string;
  title?: string;
  referrerSource?: string | null;
  referrerUrl?: string;
  duration?: number;
  at: number;
}

export interface VisitorDoc {
  _id: string;
  siteId: string;
  visitorId: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  referrerUrl?: string;
  referrerDomain?: string;
  referrerSource?: string | null;
  referrerHandle?: string | null;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  landingPage?: string;
  locale?: string;
  device?: string;
  browser?: string;
  os?: string;
  screen?: string;
  sessions: number;
  pageViews: number;
  timeOnSiteSec: number;
  outboundClicks: number;
  identity?: { name?: string; email?: string; handle?: string; via?: string };
  score: number;
  isLead: boolean;
  events: VisitorEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadDoc {
  _id: string;
  companyId: string;
  siteId?: string;
  visitorId?: string;
  source: string;
  person?: { name?: string; email?: string; handle?: string; via?: string };
  title?: string;
  url?: string;
  note?: string;
  referrerSource?: string | null;
  referrerUrl?: string;
  landingPage?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  pageViews?: number;
  timeOnSiteSec?: number;
  score: number;
  status: "new" | "contacted" | "qualified" | "converted" | "closed";
  firstSeenAt: Date;
  lastSeenAt: Date;
  events: VisitorEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetitorDoc {
  _id: string;
  companyId: string;
  name: string;
  domain: string;
  website: string;
  meta?: {
    title?: string;
    description?: string;
    logo?: string;
    socials?: Record<string, string>;
  };
  platformsDetected: string[];
  lastFetchedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchQueryDoc {
  _id: string;
  companyId: string;
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  page?: number;
  date: string; // YYYY-MM-DD
  source: "search-console" | "cse";
  updatedAt: Date;
}

export interface PendingAuthDoc {
  _id: string;
  companyId: string;
  provider: SourceProvider;
  state: string;
  codeVerifier?: string;
  redirectTo?: string;
  consumedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const VisitorEventSchema = new Schema(
  {
    type: String,
    page: String,
    url: String,
    title: String,
    referrerSource: String,
    referrerUrl: String,
    duration: Number,
    at: Number,
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

const CompanySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    legalName: { type: String, trim: true },
    tagline: { type: String, trim: true },
    description: { type: String },
    industry: { type: String, trim: true },
    website: { type: String, trim: true },
    logoUrl: { type: String },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    address: { type: String },
    city: { type: String, trim: true },
    country: { type: String, trim: true },
    socials: {
      linkedin: String,
      instagram: String,
      twitter: String,
      youtube: String,
      facebook: String,
      reddit: String,
    },
    autofillMeta: { source: String, filledAt: Date },
  },
  { timestamps: true }
);

const SourceConnectionSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    provider: {
      type: String,
      enum: ["linkedin", "instagram", "twitter", "youtube", "facebook", "reddit", "domain", "search-console"],
      required: true,
    },
    status: { type: String, enum: ["pending", "connected", "verified", "error"], default: "pending" },
    accountId: String,
    accountName: String,
    accountUrl: String,
    accessTokenEnc: String,
    refreshTokenEnc: String,
    tokenExpiresAt: Date,
    scopes: [String],
    // domain verification fields
    domain: String,
    verificationToken: String,
    verifiedAt: Date,
    lastSyncedAt: Date,
    lastError: String,
  },
  { timestamps: true }
);
SourceConnectionSchema.index({ companyId: 1, provider: 1 }, { unique: true });

const VisitorSchema = new Schema(
  {
    siteId: { type: Schema.Types.ObjectId, ref: "SourceConnection", required: true, index: true },
    visitorId: { type: String, required: true },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    referrerUrl: String,
    referrerDomain: String,
    referrerSource: String,
    referrerHandle: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    utmContent: String,
    utmTerm: String,
    landingPage: String,
    locale: String,
    device: String,
    browser: String,
    os: String,
    screen: String,
    sessions: { type: Number, default: 0 },
    pageViews: { type: Number, default: 0 },
    timeOnSiteSec: { type: Number, default: 0 },
    outboundClicks: { type: Number, default: 0 },
    identity: {
      name: String,
      email: String,
      handle: String,
      via: String,
    },
    score: { type: Number, default: 0 },
    isLead: { type: Boolean, default: false },
    events: { type: [VisitorEventSchema], default: [] },
  },
  { timestamps: true }
);
VisitorSchema.index({ siteId: 1, visitorId: 1 }, { unique: true });

const LeadSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    siteId: { type: Schema.Types.ObjectId, ref: "SourceConnection" },
    visitorId: String,
    source: { type: String, required: true, default: "tracking" },
    person: {
      name: String,
      email: String,
      handle: String,
      via: String,
    },
    title: String,
    url: String,
    note: String,
    referrerSource: String,
    referrerUrl: String,
    landingPage: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    pageViews: Number,
    timeOnSiteSec: Number,
    score: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "converted", "closed"],
      default: "new",
    },
    firstSeenAt: Date,
    lastSeenAt: Date,
    events: { type: [VisitorEventSchema], default: [] },
  },
  { timestamps: true }
);
LeadSchema.index({ companyId: 1, visitorId: 1 }, { unique: true, sparse: true });

const CompetitorSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    name: { type: String, required: true, trim: true },
    domain: { type: String, required: true, trim: true },
    website: { type: String, required: true },
    meta: {
      title: String,
      description: String,
      logo: String,
      socials: { type: Map, of: String },
    },
    platformsDetected: [String],
    lastFetchedAt: Date,
  },
  { timestamps: true }
);

const SearchQuerySchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    query: { type: String, required: true },
    clicks: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    position: { type: Number, default: 0 },
    page: Number,
    date: { type: String, required: true }, // YYYY-MM-DD
    source: { type: String, enum: ["search-console", "cse"], default: "search-console" },
  },
  { timestamps: true }
);
SearchQuerySchema.index({ companyId: 1, source: 1, date: 1, query: 1 }, { unique: true });

const PendingAuthSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    provider: { type: String, required: true },
    state: { type: String, required: true, index: true },
    codeVerifier: String,
    redirectTo: String,
    consumedAt: Date,
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// Model accessors (no recompilation in dev / edge)
// ---------------------------------------------------------------------------

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const Company = mongoose.models.Company || mongoose.model("Company", CompanySchema);
export const SourceConnection =
  mongoose.models.SourceConnection || mongoose.model("SourceConnection", SourceConnectionSchema);
export const Visitor = mongoose.models.Visitor || mongoose.model("Visitor", VisitorSchema);
export const Lead = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
export const Competitor = mongoose.models.Competitor || mongoose.model("Competitor", CompetitorSchema);
export const SearchQuery = mongoose.models.SearchQuery || mongoose.model("SearchQuery", SearchQuerySchema);
export const PendingAuth = mongoose.models.PendingAuth || mongoose.model("PendingAuth", PendingAuthSchema);

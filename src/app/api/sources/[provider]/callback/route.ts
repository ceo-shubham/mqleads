import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Company, PendingAuth, SourceConnection } from "@/lib/models";
import { getProvider, exchangeCode, getRedirectUri, type SocialProviderId } from "@/lib/providers";
import { encrypt } from "@/lib/crypto";

const ALLOWED: SocialProviderId[] = [
  "linkedin",
  "instagram",
  "twitter",
  "youtube",
  "facebook",
  "reddit",
  "search-console",
];

export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  const baseOrigin = process.env.APP_URL?.trim().replace(/\/$/, "") || req.nextUrl.origin;
  const providerId = params.provider as SocialProviderId;
  const base = new URL("/dashboard/sources", baseOrigin);
  const fail = (message: string) => {
    const u = base;
    u.searchParams.set("error", "oauth-failed");
    u.searchParams.set("message", message);
    return NextResponse.redirect(u);
  };

  if (!ALLOWED.includes(providerId)) return fail("Unknown provider");
  const provider = getProvider(providerId)!;

  const user = await getSessionUser();
  if (!user) return NextResponse.redirect(new URL("/login", baseOrigin));

  const state = req.nextUrl.searchParams.get("state");
  const code = req.nextUrl.searchParams.get("code");
  const oauthError = req.nextUrl.searchParams.get("error");

  if (oauthError) return fail(`Provider returned an error: ${oauthError}`);
  if (!state || !code) return fail("Missing state or code from provider.");

  await dbConnect();
  const company = await Company.findOne({ userId: user._id });
  if (!company) return fail("No company found for this account — please log in again.");
  const pending = await PendingAuth.findOne({ state, consumedAt: { $exists: false } });
  if (!pending || pending.provider !== providerId) return fail("OAuth state expired — please try again.");
  if (new Date(pending.expiresAt).getTime() < Date.now()) return fail("OAuth link expired — please try again.");
  if (pending.companyId.toString() !== company._id.toString()) return fail("Session mismatch — please log in again.");

  const redirectUri = getRedirectUri(baseOrigin, providerId);
  let exchanged: { accessToken: string; refreshToken?: string; expiresIn?: number };
  try {
    exchanged = await exchangeCode(provider, code, redirectUri, pending.codeVerifier);
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Token exchange failed");
  }

  let profile;
  try {
    profile = await provider.fetchProfile(exchanged.accessToken);
  } catch (err) {
    return fail(
      `Connected, but could not read your account details: ${
        err instanceof Error ? err.message : "profile fetch failed"
      }`
    );
  }

  await SourceConnection.findOneAndUpdate(
    { companyId: pending.companyId, provider: providerId },
    {
      $set: {
        status: "connected",
        accountId: profile.accountId,
        accountName: profile.accountName,
        accountUrl: profile.accountUrl,
        accessTokenEnc: encrypt(exchanged.accessToken),
        refreshTokenEnc: exchanged.refreshToken ? encrypt(exchanged.refreshToken) : undefined,
        tokenExpiresAt: exchanged.expiresIn ? new Date(Date.now() + exchanged.expiresIn * 1000) : undefined,
        scopes: provider.scopes,
        lastError: undefined,
      },
    },
    { upsert: true }
  );

  // Auto-link Meta sister platform so user only has to connect once!
  if (providerId === "facebook") {
    const igHandle = profile.accountName.includes("@")
      ? profile.accountName
      : `@${profile.accountName.toLowerCase().replace(/[^a-z0-9_]/g, "_")}`;

    await SourceConnection.findOneAndUpdate(
      { companyId: pending.companyId, provider: "instagram" },
      {
        $set: {
          status: "connected",
          accountId: profile.accountId,
          accountName: igHandle,
          accountUrl: "https://instagram.com/",
          accessTokenEnc: encrypt(exchanged.accessToken),
          refreshTokenEnc: exchanged.refreshToken ? encrypt(exchanged.refreshToken) : undefined,
          tokenExpiresAt: exchanged.expiresIn ? new Date(Date.now() + exchanged.expiresIn * 1000) : undefined,
          scopes: ["public_profile"],
          lastError: undefined,
        },
      },
      { upsert: true }
    );
  } else if (providerId === "instagram") {
    await SourceConnection.findOneAndUpdate(
      { companyId: pending.companyId, provider: "facebook" },
      {
        $set: {
          status: "connected",
          accountId: profile.accountId,
          accountName: profile.accountName.replace(/^@/, ""),
          accountUrl: "https://facebook.com/",
          accessTokenEnc: encrypt(exchanged.accessToken),
          refreshTokenEnc: exchanged.refreshToken ? encrypt(exchanged.refreshToken) : undefined,
          tokenExpiresAt: exchanged.expiresIn ? new Date(Date.now() + exchanged.expiresIn * 1000) : undefined,
          scopes: ["public_profile"],
          lastError: undefined,
        },
      },
      { upsert: true }
    );
  }

  await PendingAuth.updateOne({ _id: pending._id }, { $set: { consumedAt: new Date() } });

  const u = base;
  u.searchParams.set("connected", providerId);
  return NextResponse.redirect(u);
}

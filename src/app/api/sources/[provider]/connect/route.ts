import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { Company, PendingAuth } from "@/lib/models";
import { getProvider, buildAuthUrl, getRedirectUri, type SocialProviderId } from "@/lib/providers";
import { randomToken } from "@/lib/crypto";

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
  if (!ALLOWED.includes(providerId)) {
    return NextResponse.redirect(new URL("/dashboard/sources?error=unknown-provider", baseOrigin));
  }
  const provider = getProvider(providerId)!;

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.redirect(new URL(`/login?next=/dashboard/sources`, baseOrigin));
  }

  if (!provider.isConfigured()) {
    const missing = provider.missingEnv().join(", ");
    return NextResponse.redirect(
      new URL(`/dashboard/sources?error=not-configured&provider=${providerId}&missing=${missing}`, baseOrigin)
    );
  }

  await dbConnect();
  const company = await Company.findOne({ userId: user._id });
  if (!company) return NextResponse.redirect(new URL("/login", baseOrigin));

  const state = randomToken(16);
  const redirectUri = getRedirectUri(baseOrigin, providerId);
  const { url, codeVerifier } = buildAuthUrl(provider, state, redirectUri);

  await PendingAuth.create({
    companyId: company._id,
    provider: providerId,
    state,
    codeVerifier,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
  });

  return NextResponse.redirect(url);
}

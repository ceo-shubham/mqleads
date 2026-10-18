import { NextRequest, NextResponse } from "next/server";
import { randomToken } from "@/lib/crypto";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseOrigin = process.env.APP_URL?.trim().replace(/\/$/, "") || req.nextUrl.origin;

  if (!clientId) {
    return NextResponse.redirect(new URL("/login?error=Google+login+not+configured+yet", baseOrigin));
  }

  const redirectUri = `${baseOrigin}/api/auth/google/callback`;
  const state = randomToken(16);

  cookies().set("mqleads_google_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "select_account",
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/db";
import { User, Company } from "@/lib/models";
import { signSession, hashPassword } from "@/lib/auth";
import { randomBytes } from "crypto";
import { autoProvisionWorkspace } from "@/lib/onboarding";

export async function GET(req: NextRequest) {
  const baseOrigin = process.env.APP_URL?.trim().replace(/\/$/, "") || req.nextUrl.origin;
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const oauthError = req.nextUrl.searchParams.get("error");

  if (oauthError || !code) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(oauthError || "Google sign-in was cancelled")}`, baseOrigin)
    );
  }

  const savedState = cookies().get("mqleads_google_state")?.value;
  cookies().set("mqleads_google_state", "", { httpOnly: true, path: "/", maxAge: 0 });

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(new URL("/login?error=State+verification+failed.+Please+try+again.", baseOrigin));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?error=Google+credentials+not+configured+on+server.", baseOrigin));
  }

  const redirectUri = `${baseOrigin}/api/auth/google/callback`;

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  });

  if (!tokenRes.ok) {
    const txt = await tokenRes.text();
    return NextResponse.redirect(
      new URL(`/login?error=Google+token+exchange+failed:+${encodeURIComponent(txt.slice(0, 80))}`, baseOrigin)
    );
  }

  const tokenData = (await tokenRes.json()) as { access_token?: string };
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login?error=No+access+token+returned+by+Google", baseOrigin));
  }

  // Fetch Google user profile
  const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userinfoRes.ok) {
    return NextResponse.redirect(new URL("/login?error=Could+not+fetch+Google+profile", baseOrigin));
  }

  const profile = (await userinfoRes.json()) as {
    sub: string;
    email?: string;
    name?: string;
    picture?: string;
  };

  if (!profile.email) {
    return NextResponse.redirect(new URL("/login?error=No+email+associated+with+Google+account", baseOrigin));
  }

  await dbConnect();
  const email = profile.email.toLowerCase();
  let user = await User.findOne({ email });

  if (!user) {
    // Automatically register new user & workspace
    const randomPw = randomBytes(24).toString("hex");
    const passwordHash = await hashPassword(randomPw);
    const name = profile.name || email.split("@")[0] || "User";
    user = await User.create({
      name,
      email,
      passwordHash,
    });
    const company = await Company.create({
      userId: user._id,
      name: `${name}'s Workspace`,
    });
    await autoProvisionWorkspace(company._id, user.email);
  } else {
    const company = await Company.findOne({ userId: user._id });
    if (company) {
      await autoProvisionWorkspace(company._id, user.email);
    }
  }

  // Set session cookie
  const sessionToken = await signSession(user._id.toString());
  cookies().set("mqleads_session", sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.redirect(new URL("/dashboard", baseOrigin));
}

export const dynamic = "force-dynamic";

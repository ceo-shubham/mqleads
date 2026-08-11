import { NextResponse } from "next/server";
import { dbConnect } from "./db";
import { getSessionUser } from "./auth";
import { User, Company, type CompanyDoc, type UserDoc } from "./models";

export function json(data: unknown, status = 200, headers?: Record<string, string>): NextResponse {
  return NextResponse.json(data, { status, headers });
}

export function error(
  message: string,
  status = 400,
  extra?: Record<string, unknown>,
  headers?: Record<string, string>
): NextResponse {
  return NextResponse.json({ error: message, ...extra }, { status, headers });
}

/**
 * Resolves the logged-in user + their company for an API route.
 * Returns `null` when unauthenticated; callers should return 401.
 */
export async function requireCompany(): Promise<{ user: UserDoc; company: CompanyDoc } | null> {
  const user = await getSessionUser();
  if (!user) return null;
  await dbConnect();
  const company = (await Company.findOne({ userId: user._id }).lean()) as CompanyDoc | null;
  if (!company) return null;
  return { user, company };
}

/** Finds a user by email/name for registration checks. */
export async function findUserByEmail(email: string) {
  await dbConnect();
  return User.findOne({ email: email.toLowerCase() }).lean();
}

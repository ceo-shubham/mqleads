import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { dbConnect } from "./db";
import { User, type UserDoc } from "./models";

const SESSION_COOKIE = "mqleads_session";
const SESSION_TTL = "30d";
const FALLBACK_SECRET = "mqleads-insecure-dev-secret-change-me";

function secretKey(): Uint8Array {
  return new TextEncoder().encode(process.env.APP_SECRET || FALLBACK_SECRET);
}

export async function signSession(uid: string): Promise<string> {
  return new SignJWT({ uid })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(secretKey());
}

export async function verifySession(token: string): Promise<{ uid: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (typeof payload.uid !== "string") return null;
    return { uid: payload.uid };
  } catch {
    return null;
  }
}

/** Resolves the logged-in user from the session cookie (server-side only). */
export async function getSessionUser(): Promise<UserDoc | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySession(token);
  if (!payload) return null;
  await dbConnect();
  const user = (await User.findById(payload.uid).lean()) as UserDoc | null;
  return user;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

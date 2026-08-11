import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const FALLBACK_SECRET = "mqleads-insecure-dev-secret-change-me";

function secretKey(): Buffer {
  const secret = process.env.APP_SECRET || FALLBACK_SECRET;
  return createHash("sha256").update(secret).digest();
}

/** Encrypts a plaintext string (e.g. an OAuth access token) into "iv.tag.data". */
export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", secretKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64url"), tag.toString("base64url"), enc.toString("base64url")].join(".");
}

/** Decrypts a payload produced by {@link encrypt}. */
export function decrypt(payload: string): string {
  const [ivB, tagB, dataB] = payload.split(".");
  if (!ivB || !tagB || !dataB) throw new Error("Malformed encrypted payload");
  const decipher = createDecipheriv("aes-256-gcm", secretKey(), Buffer.from(ivB, "base64url"));
  decipher.setAuthTag(Buffer.from(tagB, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

/** Small helper for random tokens (domain verification, CSRF state, ...). */
export function randomToken(bytes = 16): string {
  return randomBytes(bytes).toString("hex");
}

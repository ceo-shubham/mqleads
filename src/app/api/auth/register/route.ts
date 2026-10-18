import { NextRequest } from "next/server";
import { z } from "zod";
import { json, error } from "@/lib/api";
import { dbConnect } from "@/lib/db";
import { User, Company } from "@/lib/models";
import { hashPassword, signSession, SESSION_MAX_AGE_SECONDS } from "@/lib/auth";
import { cookies } from "next/headers";
import { autoProvisionWorkspace } from "@/lib/onboarding";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  companyName: z.string().min(1).max(120),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return error("Please check the form: " + parsed.error.issues.map((i) => i.message).join(", "));
  }
  const { name, email, password, companyName } = parsed.data;

  try {
    await dbConnect();
  } catch (e) {
    return error(
      "Database unavailable — check MONGODB_URI (see /api/health for details)",
      503,
      { detail: String(e instanceof Error ? e.message : e).slice(0, 300) }
    );
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return error("An account with this email already exists.", 409);

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash });
  const company = await Company.create({ userId: user._id, name: companyName });
  await autoProvisionWorkspace(company._id, user.email);

  const token = await signSession(user._id.toString());
  cookies().set("mqleads_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return json({ ok: true, user: { id: user._id.toString(), name: user.name, email: user.email } }, 201);
}

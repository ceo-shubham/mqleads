import { NextRequest } from "next/server";
import { z } from "zod";
import { json, error } from "@/lib/api";
import { dbConnect } from "@/lib/db";
import { User, Company } from "@/lib/models";
import { hashPassword, signSession } from "@/lib/auth";
import { cookies } from "next/headers";

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

  await dbConnect();
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return error("An account with this email already exists.", 409);

  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash });
  await Company.create({ userId: user._id, name: companyName });

  const token = await signSession(user._id.toString());
  cookies().set("mqleads_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return json({ ok: true, user: { id: user._id.toString(), name: user.name, email: user.email } }, 201);
}

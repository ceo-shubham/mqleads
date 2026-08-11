import { NextRequest } from "next/server";
import { z } from "zod";
import { json, error } from "@/lib/api";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models";
import { verifyPassword, signSession } from "@/lib/auth";
import { cookies } from "next/headers";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error("Invalid email or password");

  await dbConnect();
  const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
  if (!user) return error("Invalid email or password", 401);

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return error("Invalid email or password", 401);

  const token = await signSession(user._id.toString());
  cookies().set("mqleads_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return json({ ok: true, user: { id: user._id.toString(), name: user.name, email: user.email } });
}

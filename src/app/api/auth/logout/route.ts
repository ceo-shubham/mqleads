import { cookies } from "next/headers";
import { json } from "@/lib/api";

export async function POST() {
  cookies().set("mqleads_session", "", { httpOnly: true, path: "/", maxAge: 0 });
  return json({ ok: true });
}

import { json } from "@/lib/api";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";

/**
 * Public diagnostic endpoint — no auth. Hit
 *   https://<your-app>/api/health
 * to see exactly why the database connection is (or is not) working.
 * Never returns secrets: the URI password is masked.
 */
export async function GET() {
  const uri = process.env.MONGODB_URI || "";
  const report: Record<string, unknown> = {
    ok: false,
    app: "MQLeads",
    time: new Date().toISOString(),
  };

  // --- URI shape (masked) ------------------------------------------------
  if (!uri) {
    report.uri = "NOT SET — add MONGODB_URI to your env";
    report.ok = false;
    return json(report, 503);
  }

  let masked = uri;
  try {
    const u = new URL(uri.replace(/^mongodb\+srv/i, "mongodb"));
    masked = `${u.protocol}//${u.host}${u.pathname}${u.search}`;
  } catch {
    masked = "(unparseable URI)";
  }
  report.uri = masked;
  report.usernameIsPlaceholder = uri.includes("<db_username>") || uri.includes("<username>");
  report.passwordIsPlaceholder = uri.includes("<db_password>") || uri.includes("<password>");
  report.hasDatabaseName = /mongodb(\+srv)?:\/\/[^/]+\/[^/?]+/.test(uri);
  report.hostname = uri.replace(/^[a-z]+(\+srv)?:\/\//, "").split("@").pop()?.split("/")[0] || "(none)";

  // --- actual connection test --------------------------------------------
  try {
    await dbConnect();
    await mongoose.connection.db!.admin().command({ ping: 1 });
    report.ok = true;
    report.db = "connected";
  } catch (e) {
    report.db = "error";
    report.error = String(e instanceof Error ? e.message : e).slice(0, 400);
  }

  return json(report, report.ok ? 200 : 503);
}

export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { json, error, requireCompany } from "@/lib/api";
import { uploadToB2, b2Configured } from "@/lib/b2";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

export async function POST(req: NextRequest) {
  const ctx = await requireCompany();
  if (!ctx) return error("Not authenticated", 401);

  if (!b2Configured()) {
    return error(
      "Backblaze B2 is not configured yet. Add the B2_* variables to .env (see .env.example), or paste a logo URL instead."
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return error("No file uploaded");
  if (file.size > MAX_SIZE) return error("Logo must be under 2 MB");

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const key = `companies/${ctx.company._id}/logo-${Date.now()}.${ext}`;

  try {
    const { url } = await uploadToB2({
      key,
      body: buffer,
      contentType: file.type || "image/png",
    });
    return json({ ok: true, url });
  } catch (err) {
    return error(err instanceof Error ? err.message : "Upload failed", 502);
  }
}

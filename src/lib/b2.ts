import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

/** True when all Backblaze B2 env vars are present. */
export function b2Configured(): boolean {
  return Boolean(
    process.env.B2_APPLICATION_KEY_ID &&
      process.env.B2_APPLICATION_KEY &&
      process.env.B2_BUCKET &&
      process.env.B2_ENDPOINT
  );
}

function client(): S3Client {
  return new S3Client({
    region: process.env.B2_REGION || "us-west-000",
    endpoint: process.env.B2_ENDPOINT as string,
    credentials: {
      accessKeyId: process.env.B2_APPLICATION_KEY_ID as string,
      secretAccessKey: process.env.B2_APPLICATION_KEY as string,
    },
  });
}

export interface UploadResult {
  key: string;
  url: string;
}

/**
 * Uploads a buffer to Backblaze B2. Returns the public URL when
 * B2_PUBLIC_URL is set (bucket must be public), otherwise the S3 endpoint URL.
 * Throws when B2 is not configured.
 */
export async function uploadToB2(opts: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<UploadResult> {
  if (!b2Configured()) {
    throw new Error("Backblaze B2 is not configured. Set B2_* env vars (see .env.example).");
  }
  await client().send(
    new PutObjectCommand({
      Bucket: process.env.B2_BUCKET as string,
      Key: opts.key,
      Body: opts.body,
      ContentType: opts.contentType,
      ACL: "public-read",
    })
  );
  const base = process.env.B2_PUBLIC_URL || `${process.env.B2_ENDPOINT}/${process.env.B2_BUCKET}`;
  return { key: opts.key, url: `${base.replace(/\/$/, "")}/${opts.key}` };
}

export async function deleteFromB2(key: string): Promise<void> {
  if (!b2Configured()) return;
  await client().send(
    new DeleteObjectCommand({ Bucket: process.env.B2_BUCKET as string, Key: key })
  );
}

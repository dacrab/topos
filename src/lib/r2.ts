import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { UploadType } from "./types";

const required = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_PUBLIC_URL",
  "R2_BUCKET_NAME",
];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) throw new Error(`Missing R2 env vars: ${missing.join(", ")}`);

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID as string;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID as string;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY as string;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL as string;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME as string;

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

function getPublicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}

export function generateImageKey(tenantId: string, type: UploadType, filename: string): string {
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${tenantId}/${type}/${Date.now()}-${sanitized}`;
}

export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return getPublicUrl(key);
}

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const R2_ACCOUNT_ID = getEnvVar("R2_ACCOUNT_ID");
const R2_ACCESS_KEY_ID = getEnvVar("R2_ACCESS_KEY_ID");
const R2_SECRET_ACCESS_KEY = getEnvVar("R2_SECRET_ACCESS_KEY");
const R2_BUCKET_NAME = getEnvVar("R2_BUCKET_NAME");
const R2_PUBLIC_URL = getEnvVar("R2_PUBLIC_URL");

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function generateUploadUrl(
  key: string,
  contentType: string,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(r2Client, command, { expiresIn: 3600 }); // 1 hour
}

export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await r2Client.send(command);

  return getPublicUrl(key);
}

export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}

export function getPublicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}

export function getKeyFromUrl(url: string): string | null {
  if (!url.startsWith(R2_PUBLIC_URL)) return null;
  return url.replace(`${R2_PUBLIC_URL}/`, "");
}

import type { UploadType } from "./upload-constants";

export function generateImageKey(
  tenantId: string,
  type: UploadType,
  filename: string,
): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${tenantId}/${type}/${timestamp}-${sanitizedFilename}`;
}

import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { UploadType } from "./types";

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env("R2_ACCESS_KEY_ID"),
      secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    },
  });
}

export const r2Client = getR2Client();

export async function generateUploadUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env("R2_BUCKET_NAME"),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2Client, command, { expiresIn: 3600 });
}

export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env("R2_BUCKET_NAME"),
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  await r2Client.send(command);
  return getPublicUrl(key);
}

export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({ Bucket: env("R2_BUCKET_NAME"), Key: key });
  await r2Client.send(command);
}

export function getPublicUrl(key: string): string {
  return `${env("R2_PUBLIC_URL")}/${key}`;
}

export function getKeyFromUrl(url: string): string | null {
  const publicUrl = env("R2_PUBLIC_URL");
  if (!url.startsWith(publicUrl)) return null;
  return url.replace(`${publicUrl}/`, "");
}

export function generateImageKey(tenantId: string, type: UploadType, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${tenantId}/${type}/${timestamp}-${sanitizedFilename}`;
}

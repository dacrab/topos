import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { UploadType } from "./types";

function getR2Config() {
  const env = process.env;
  const required = [
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_PUBLIC_URL",
    "R2_BUCKET_NAME",
  ] as const;
  for (const key of required) {
    if (!env[key]) throw new Error(`Missing R2 env var: ${key}`);
  }
  return {
    accountId: env.R2_ACCOUNT_ID as string,
    accessKeyId: env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY as string,
    publicUrl: env.R2_PUBLIC_URL as string,
    bucketName: env.R2_BUCKET_NAME as string,
  };
}

let _client: S3Client | null = null;
function getClient() {
  if (!_client) {
    const config = getR2Config();
    _client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return _client;
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
  const config = getR2Config();
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return `${config.publicUrl}/${key}`;
}

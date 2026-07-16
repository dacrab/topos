import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { UploadType } from "./types";

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing R2 env var: ${key}`);
  return val;
}

function getR2Config() {
  return {
    accountId: requireEnv("R2_ACCOUNT_ID"),
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    bucketName: requireEnv("R2_BUCKET_NAME"),
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
  const command = new GetObjectCommand({ Bucket: config.bucketName, Key: key });
  return getSignedUrl(client as unknown as Parameters<typeof getSignedUrl>[0], command, {
    expiresIn: 3600,
  });
}

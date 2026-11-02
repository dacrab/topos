import { AwsClient } from "aws4fetch";

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing R2 env var: ${key}`);
  return val;
}

let _config: {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicBaseUrl: string;
} | null = null;

function getConfig() {
  if (!_config) {
    _config = {
      accountId: requireEnv("R2_ACCOUNT_ID"),
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
      bucketName: requireEnv("R2_BUCKET_NAME"),
      publicBaseUrl: requireEnv("R2_PUBLIC_URL").replace(/\/+$/, ""),
    };
  }
  return _config;
}

let _client: AwsClient | null = null;
function getClient() {
  if (!_client) {
    const config = getConfig();
    _client = new AwsClient({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      service: "s3",
      region: "auto",
    });
  }
  return _client;
}

export function storageKey(tenantId: string, folder: string, filename: string): string {
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${tenantId}/${folder}/${Date.now()}-${sanitized}`;
}

function objectUrl(accountId: string, bucketName: string, key: string): string {
  return `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${key}`;
}

/** Retries transient failures the way the AWS SDK did, without the SDK. */
async function putObject(url: string, body: BodyInit, contentType: string): Promise<void> {
  let lastError = "unknown error";

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await getClient().fetch(url, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body,
    });
    if (res.ok) return;

    const detail = await res.text().catch(() => "");
    lastError = `HTTP ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`;

    // Only network/5xx/429 failures are worth retrying.
    if (res.status !== 429 && res.status < 500) break;
  }

  throw new Error(`R2 upload failed (${lastError})`);
}

export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  const config = getConfig();
  await putObject(
    objectUrl(config.accountId, config.bucketName, key),
    body as BodyInit,
    contentType,
  );
  return `${config.publicBaseUrl}/${key}`;
}

import "server-only";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  DATABASE_URL: requireEnv("DATABASE_URL"),
  NEXT_PUBLIC_ROOT_DOMAIN: optionalEnv("NEXT_PUBLIC_ROOT_DOMAIN", "localhost:3000"),
  NEXT_PUBLIC_SUPPORT_EMAIL: optionalEnv("NEXT_PUBLIC_SUPPORT_EMAIL", "support@example.com"),
  RESEND_API_KEY: optionalEnv("RESEND_API_KEY", ""),
  EMAIL_FROM: optionalEnv("EMAIL_FROM", "Topos <onboarding@resend.dev>"),
  POLAR_ACCESS_TOKEN: optionalEnv("POLAR_ACCESS_TOKEN", ""),
  CLERK_WEBHOOK_SECRET: optionalEnv("CLERK_WEBHOOK_SECRET", ""),
} as const;

export function requireR2Config() {
  return {
    accountId: requireEnv("R2_ACCOUNT_ID"),
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    publicUrl: requireEnv("R2_PUBLIC_URL"),
    bucketName: requireEnv("R2_BUCKET_NAME"),
  };
}

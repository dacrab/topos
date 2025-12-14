import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

const sendMock: Mock = vi.fn();

vi.mock("@aws-sdk/client-s3", () => {
  const S3Client = vi.fn(function MockS3Client(this: {
    send: typeof sendMock;
  }) {
    this.send = sendMock;
  });

  const PutObjectCommand = vi.fn(function MockPutObjectCommand(
    this: { input: unknown },
    input: unknown,
  ) {
    this.input = input;
  });

  const DeleteObjectCommand = vi.fn(function MockDeleteObjectCommand(
    this: { input: unknown },
    input: unknown,
  ) {
    this.input = input;
  });

  return {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
  };
});

const getSignedUrlMock: Mock = vi.fn(
  async () => "https://signed.example.com/object",
);

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: getSignedUrlMock,
}));

async function importR2() {
  return import("@/lib/r2");
}

beforeEach(() => {
  vi.resetModules();
  sendMock.mockClear();
  getSignedUrlMock.mockClear();

  process.env.R2_ACCOUNT_ID = "test-account-id";
  process.env.R2_ACCESS_KEY_ID = "test-access-id";
  process.env.R2_SECRET_ACCESS_KEY = "test-value-123";
  process.env.R2_BUCKET_NAME = "test-bucket";
  process.env.R2_PUBLIC_URL = "https://public.example.com";
});

describe("r2 helpers", () => {
  it("builds public URLs and extracts keys symmetrically", async () => {
    const { getPublicUrl, getKeyFromUrl } = await importR2();

    const key = "tenant-1/listing/hero.png";
    const url = getPublicUrl(key);

    expect(url).toBe(`https://public.example.com/${key}`);
    expect(getKeyFromUrl(url)).toBe(key);
  });

  it("returns null from getKeyFromUrl when the URL does not use the R2 public base", async () => {
    const { getKeyFromUrl } = await importR2();

    const result = getKeyFromUrl(
      "https://other.example.com/tenant-1/listing/hero.png",
    );
    expect(result).toBeNull();
  });

  it("generates deterministic, sanitized image keys", async () => {
    const { generateImageKey } = await importR2();

    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(1700000000000);

    const key = generateImageKey("tenant-42", "listing", "My hero image.png");

    expect(key).toBe("tenant-42/listing/1700000000000-My_hero_image.png");

    nowSpy.mockRestore();
  });

  it("uses the AWS SDK presigner when generating upload URLs", async () => {
    const { generateUploadUrl } = await importR2();

    const url = await generateUploadUrl("tenant-1/listing.png", "image/png");

    expect(url).toBe("https://signed.example.com/object");
    expect(getSignedUrlMock).toHaveBeenCalledTimes(1);

    const mock = getSignedUrlMock as Mock;
    const firstCall = (mock.mock.calls[0] ?? []) as unknown[];
    const command = firstCall[1] as { input: unknown };
    const options = firstCall[2] as Record<string, unknown> | undefined;

    expect(command.input).toEqual({
      Bucket: "test-bucket",
      Key: "tenant-1/listing.png",
      ContentType: "image/png",
    });
    expect(options).toMatchObject({ expiresIn: 3600 });
  });

  it("uploads and deletes objects through the shared S3 client", async () => {
    const { uploadToR2, deleteFromR2, getPublicUrl } = await importR2();

    const body = new Uint8Array([1, 2, 3]);
    const key = "tenant-1/listing/asset.bin";

    const publicUrl = await uploadToR2(key, body, "application/octet-stream");

    expect(publicUrl).toBe(getPublicUrl(key));
    expect(sendMock).toHaveBeenCalledTimes(1);

    const firstCall = (sendMock.mock.calls[0] ?? []) as unknown[];
    const firstArg = firstCall[0] as { input: unknown };

    expect(firstArg.input).toEqual({
      Bucket: "test-bucket",
      Key: key,
      Body: body,
      ContentType: "application/octet-stream",
    });

    await deleteFromR2(key);

    expect(sendMock).toHaveBeenCalledTimes(2);

    const secondCall = (sendMock.mock.calls[1] ?? []) as unknown[];
    const secondArg = secondCall[0] as { input: unknown };

    expect(secondArg.input).toEqual({
      Bucket: "test-bucket",
      Key: key,
    });
  });

  it("throws a clear error when required env vars are missing at import time", async () => {
    vi.resetModules();

    delete process.env.R2_ACCOUNT_ID;

    await expect(import("@/lib/r2")).rejects.toThrow(
      /Missing required environment variable: R2_ACCOUNT_ID/,
    );

    process.env.R2_ACCOUNT_ID = originalEnv.R2_ACCOUNT_ID;
  });
});

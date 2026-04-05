import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.fn();
const getSignedUrlMock = vi.fn(async () => "https://signed.example.com/object");

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: vi.fn(function (this: { send: typeof sendMock }) {
    this.send = sendMock;
  }),
  PutObjectCommand: vi.fn(function (this: { input: unknown }, input: unknown) {
    this.input = input;
  }),
  DeleteObjectCommand: vi.fn(function (this: { input: unknown }, input: unknown) {
    this.input = input;
  }),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: getSignedUrlMock,
}));

beforeEach(() => {
  vi.resetModules();
  sendMock.mockClear();
  getSignedUrlMock.mockClear();
  process.env.R2_ACCOUNT_ID = "test-account";
  process.env.R2_ACCESS_KEY_ID = "test-key";
  process.env.R2_SECRET_ACCESS_KEY = "test-secret";
  process.env.R2_BUCKET_NAME = "test-bucket";
  process.env.R2_PUBLIC_URL = "https://public.example.com";
});

describe("r2", () => {
  it("generates correct public URLs and keys", async () => {
    const { getPublicUrl } = await import("@/lib/r2");
    const key = "tenant-1/listing/hero.png";

    expect(getPublicUrl(key)).toBe(`https://public.example.com/${key}`);
  });

  it("generates sanitized image keys with timestamp", async () => {
    const { generateImageKey } = await import("@/lib/r2");
    vi.spyOn(Date, "now").mockReturnValue(1700000000000);

    expect(generateImageKey("t1", "listing", "My image.png")).toBe(
      "t1/listing/1700000000000-My_image.png",
    );
  });

  it("creates signed upload urls with one hour expiry", async () => {
    const { generateUploadUrl, r2Client } = await import("@/lib/r2");

    await expect(generateUploadUrl("key", "image/png")).resolves.toBe(
      "https://signed.example.com/object",
    );
    expect(getSignedUrlMock).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
      expiresIn: 3600,
    });
    const firstCall = getSignedUrlMock.mock.calls[0] as unknown[] | undefined;
    expect(firstCall?.[0]).toBe(r2Client);
  });

  it("uploads and deletes via S3 client", async () => {
    const { uploadToR2, deleteFromR2 } = await import("@/lib/r2");

    await uploadToR2("key", new Uint8Array([1]), "image/png");
    expect(sendMock).toHaveBeenCalledTimes(1);

    await deleteFromR2("key");
    expect(sendMock).toHaveBeenCalledTimes(2);
  });

  it("throws when env vars missing", async () => {
    vi.resetModules();
    delete process.env.R2_ACCOUNT_ID;
    await expect(import("@/lib/r2")).rejects.toThrow(/R2_ACCOUNT_ID/);
  });
});

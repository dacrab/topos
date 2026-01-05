export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

export const UPLOAD_TYPES = ["listing", "logo", "agent", "user"] as const;
export type UploadType = (typeof UPLOAD_TYPES)[number];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

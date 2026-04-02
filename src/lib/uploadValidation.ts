import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE, UPLOAD_TYPES, type UploadType } from "@/lib/constants";

export type UploadValidationResult = { ok: true; type: UploadType } | { ok: false; error: string };

export function validateUploadType(type: string | null): UploadValidationResult {
  if (!type || !UPLOAD_TYPES.includes(type as UploadType)) {
    return { ok: false, error: "Invalid upload type" };
  }

  return { ok: true, type: type as UploadType };
}

export function validateImageContentType(contentType: string): UploadValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    return { ok: false, error: "File type not allowed" };
  }

  return { ok: true, type: "listing" };
}

export function validateImageFile(
  file: File | null,
  type: string | null,
): { ok: true; type: UploadType; file: File } | { ok: false; error: string } {
  if (!file) {
    return { ok: false, error: "No file provided" };
  }

  const uploadType = validateUploadType(type);
  if (!uploadType.ok) {
    return uploadType;
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, error: "File type not allowed" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` };
  }

  return { ok: true, type: uploadType.type, file };
}

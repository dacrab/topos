import { MAX_FILE_SIZE } from "./config";
import type { UploadType } from "./types";

export type ImageValidationError = "imageTypeError" | "imageSizeError";

/** Returns a translation key for the validation failure, or null when the file is acceptable. */
export function validateImage(file: File): ImageValidationError | null {
  if (!file.type.startsWith("image/")) return "imageTypeError";
  if (file.size > MAX_FILE_SIZE) return "imageSizeError";
  return null;
}

/** Uploads one file to the shared upload endpoint and returns its public URL. */
export async function uploadFile(file: File, type: UploadType): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const body: { url?: string; error?: string } = await res.json();
  if (!(res.ok && body.url)) throw new Error(body.error ?? "Upload failed");
  return body.url;
}

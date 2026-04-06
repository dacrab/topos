import { type NextRequest, NextResponse } from "next/server";
import { getCurrentTenant } from "@/lib/currentTenant";
import { generateImageKey, uploadToR2 } from "@/lib/r2";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE, UPLOAD_TYPES, type UploadType } from "@/lib/types";

export const dynamic = "force-dynamic";

function validateFile(
  file: File | null,
  type: string | null,
): { ok: true; type: UploadType; file: File } | { ok: false; error: string } {
  if (!file) return { ok: false, error: "No file provided" };
  if (!type || !UPLOAD_TYPES.includes(type as UploadType))
    return { ok: false, error: "Invalid upload type" };
  if (!ALLOWED_IMAGE_TYPES.includes(file.type))
    return { ok: false, error: "File type not allowed" };
  if (file.size > MAX_FILE_SIZE)
    return { ok: false, error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` };
  return { ok: true, type: type as UploadType, file };
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await getCurrentTenant();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    const validation = validateFile(file, type);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const buffer = Buffer.from(await validation.file.arrayBuffer());
    const key = generateImageKey(tenant.id, validation.type, validation.file.name);
    const url = await uploadToR2(key, buffer, validation.file.type);

    return NextResponse.json({ url, key });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

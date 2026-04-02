import { type NextRequest, NextResponse } from "next/server";
import { getCurrentTenant } from "@/lib/currentTenant";
import { generateImageKey, generateUploadUrl, getPublicUrl } from "@/lib/r2";
import { ALLOWED_IMAGE_TYPES, UPLOAD_TYPES, type UploadType } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const tenant = await getCurrentTenant();
    const { filename, contentType, type } = await request.json();

    if (!filename || !contentType || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!type || !UPLOAD_TYPES.includes(type as UploadType)) {
      return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
    }
    if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    const key = generateImageKey(tenant.id, type as UploadType, filename);
    const uploadUrl = await generateUploadUrl(key, contentType);
    const publicUrl = getPublicUrl(key);

    return NextResponse.json({ uploadUrl, publicUrl, key });
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: server error logging
    console.error("Presign error:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}

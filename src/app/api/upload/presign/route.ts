import { type NextRequest, NextResponse } from "next/server";
import { getCurrentTenant } from "@/lib/currentTenant";
import { generateImageKey, generateUploadUrl, getPublicUrl } from "@/lib/r2";
import { validateImageContentType, validateUploadType } from "@/lib/uploadValidation";

export async function POST(request: NextRequest) {
  try {
    const tenant = await getCurrentTenant();
    const { filename, contentType, type } = await request.json();

    if (!filename || !contentType || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const uploadType = validateUploadType(type);
    if (!uploadType.ok) {
      return NextResponse.json({ error: uploadType.error }, { status: 400 });
    }

    const contentTypeValidation = validateImageContentType(contentType);
    if (!contentTypeValidation.ok) {
      return NextResponse.json({ error: contentTypeValidation.error }, { status: 400 });
    }

    const key = generateImageKey(tenant.id, uploadType.type, filename);
    const uploadUrl = await generateUploadUrl(key, contentType);
    const publicUrl = getPublicUrl(key);

    return NextResponse.json({ uploadUrl, publicUrl, key });
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: server error logging
    console.error("Presign error:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}

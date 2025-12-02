import { type NextRequest, NextResponse } from "next/server";
import { getCurrentTenant } from "@/lib/currentTenant";
import { generateImageKey, generateUploadUrl, getPublicUrl } from "@/lib/r2";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

export async function POST(request: NextRequest) {
  try {
    const tenant = await getCurrentTenant();

    const body = await request.json();
    const { filename, contentType, type } = body;

    if (!filename || !contentType || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!["listing", "logo", "agent", "user"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid upload type" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 },
      );
    }

    const key = generateImageKey(
      tenant.id,
      type as "listing" | "logo" | "agent" | "user",
      filename,
    );

    const uploadUrl = await generateUploadUrl(key, contentType);
    const publicUrl = getPublicUrl(key);

    return NextResponse.json({ uploadUrl, publicUrl, key });
  } catch (error) {
    console.error("Presign error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 },
    );
  }
}

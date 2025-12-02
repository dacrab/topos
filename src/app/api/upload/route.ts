import { type NextRequest, NextResponse } from "next/server";
import { getCurrentTenant } from "@/lib/currentTenant";
import { generateImageKey, uploadToR2 } from "@/lib/r2";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const tenant = await getCurrentTenant();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!type || !["listing", "logo", "agent", "user"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid upload type" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 10MB)" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = generateImageKey(
      tenant.id,
      type as "listing" | "logo" | "agent" | "user",
      file.name,
    );

    const url = await uploadToR2(key, buffer, file.type);

    return NextResponse.json({ url, key });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

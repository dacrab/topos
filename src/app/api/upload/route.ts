import { type NextRequest, NextResponse } from "next/server";
import { getCurrentTenant } from "@/lib/currentTenant";
import { generateImageKey, uploadToR2 } from "@/lib/r2";
import { validateImageFile } from "@/lib/uploadValidation";

export async function POST(request: NextRequest) {
  try {
    const tenant = await getCurrentTenant();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    const validation = validateImageFile(file, type);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const buffer = Buffer.from(await validation.file.arrayBuffer());
    const key = generateImageKey(tenant.id, validation.type, validation.file.name);
    const url = await uploadToR2(key, buffer, validation.file.type);

    return NextResponse.json({ url, key });
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: server error logging
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

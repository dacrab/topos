import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/config";
import { getCurrentTenant } from "@/lib/currentTenant";
import { generateImageKey, uploadToR2 } from "@/lib/r2";
import { UPLOAD_TYPES } from "@/lib/types";

export const dynamic = "force-dynamic";

const uploadSchema = z.object({
  type: z.enum(UPLOAD_TYPES),
});

export async function POST(request: NextRequest) {
  try {
    const tenant = await getCurrentTenant();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const typeRaw = formData.get("type") as string | null;

    if (!file) throw new Error("No file provided");

    const { type } = uploadSchema.parse({ type: typeRaw });

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number]))
      throw new Error("File type not allowed");
    if (file.size > MAX_FILE_SIZE)
      throw new Error(`File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`);

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = generateImageKey(tenant.id, type, file.name);
    const url = await uploadToR2(key, buffer, file.type);

    return NextResponse.json({ url, key });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

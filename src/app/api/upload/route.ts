import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/config";
import { getCurrentTenant } from "@/lib/currentTenant";
import { generateImageKey, uploadToR2 } from "@/lib/r2";
import { UPLOAD_TYPES } from "@/lib/types";

export const dynamic = "force-dynamic";

const uploadSchema = z.object({
  type: z.enum(UPLOAD_TYPES),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenant = await getCurrentTenant();
  const formData = await request.formData();
  const fileEntry = formData.get("file");
  const file = fileEntry instanceof File ? fileEntry : null;
  const typeRaw = formData.get("type")?.toString() ?? null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const parsed = uploadSchema.safeParse({ type: typeRaw });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid upload type" }, { status: 400 });
  }

  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = generateImageKey(tenant.id, parsed.data.type, file.name);
  const url = await uploadToR2(key, buffer, file.type);

  return NextResponse.json({ url, key });
}

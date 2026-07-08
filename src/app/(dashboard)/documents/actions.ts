"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { document } from "@/db/schema";
import { DOCUMENT_TYPES, MAX_FILE_SIZE } from "@/lib/config";
import { db } from "@/lib/db";
import { requireDashboardAuth } from "@/lib/page-helpers";
import { uploadToR2 } from "@/lib/r2";

export async function uploadDocument(formData: FormData) {
  const { userId, tenantId } = await requireDashboardAuth();

  const fileEntry = formData.get("file");
  const file = fileEntry instanceof File ? fileEntry : null;
  const type = formData.get("type")?.toString() ?? "";
  const dealId = formData.get("dealId")?.toString() ?? null;
  const listingId = formData.get("listingId")?.toString() ?? null;
  const contactId = formData.get("contactId")?.toString() ?? null;

  if (!file) throw new Error("No file provided");

  const parsed = z.object({ type: z.enum(DOCUMENT_TYPES) }).parse({ type });
  if (file.size > MAX_FILE_SIZE) throw new Error("File too large");

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `${tenantId}/documents/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const url = await uploadToR2(key, buffer, file.type);

  const [created] = await db
    .insert(document)
    .values({
      name: file.name,
      url,
      type: parsed.type,
      size: file.size,
      dealId: dealId || null,
      listingId: listingId || null,
      contactId: contactId || null,
      uploadedBy: userId,
      tenantId,
    })
    .returning();

  revalidatePath("/documents");
  return { success: true as const, document: created };
}

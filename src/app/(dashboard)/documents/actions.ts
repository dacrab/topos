"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { contact, deal, document, listing } from "@/db/schema";
import { actionMessages } from "@/lib/action-messages";
import { withTenant } from "@/lib/action-wrapper";
import { checkRefs, logActivity, logAudit } from "@/lib/activity";
import { ALLOWED_DOCUMENT_TYPES, DOCUMENT_TYPES, MAX_FILE_SIZE } from "@/lib/config";
import { db } from "@/lib/db";
import { storageKey, uploadToR2 } from "@/lib/r2";
import type { ActionResult } from "@/lib/types";
import { validationError } from "@/lib/validation";

const uploadDocumentSchema = z.object({
  type: z.enum(DOCUMENT_TYPES),
  dealId: z.string().optional(),
  listingId: z.string().optional(),
  contactId: z.string().optional(),
});

type DocumentRef = z.infer<typeof uploadDocumentSchema>;

type DocumentRow = typeof document.$inferSelect;
type UploadedResult = ActionResult & { document?: DocumentRow | undefined };

async function persistDocument(
  userId: string,
  tenantId: string,
  file: File,
  v: DocumentRef,
): Promise<UploadedResult> {
  const t = await actionMessages();
  const buffer = Buffer.from(await file.arrayBuffer());
  const key = storageKey(tenantId, "documents", file.name);
  const url = await uploadToR2(key, buffer, file.type);

  const [created] = await db
    .insert(document)
    .values({
      name: file.name,
      url,
      type: v.type,
      size: file.size,
      dealId: v.dealId ?? null,
      listingId: v.listingId ?? null,
      contactId: v.contactId ?? null,
      uploadedBy: userId,
      tenantId,
    })
    .returning();

  await logActivity({
    tenantId,
    type: "DOCUMENT_ADDED",
    title: `Document uploaded: ${file.name}`,
  });
  await logAudit({ tenantId, action: "CREATE", entity: "document", entityId: created?.id });

  revalidatePath("/documents");
  return { success: true, message: t("documentUploaded"), document: created };
}

/** Returns the uploaded file, or a message describing why it was rejected. */
async function validateUploadFile(formData: FormData): Promise<File | string> {
  const t = await actionMessages();
  const entry = formData.get("file");
  const file = entry instanceof File ? entry : null;
  if (!file) return t("noFileProvided");
  if (file.size > MAX_FILE_SIZE) return t("fileTooLarge");
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) return t("fileTypeNotAllowed");
  return file;
}

export async function uploadDocument(formData: FormData): Promise<UploadedResult> {
  return withTenant(async ({ userId, tenantId }) => {
    const t = await actionMessages();
    const file = await validateUploadFile(formData);
    if (typeof file === "string") return { success: false, message: file };

    const parsed = uploadDocumentSchema.safeParse({
      type: formData.get("type")?.toString() ?? "",
      dealId: formData.get("dealId")?.toString() || undefined,
      listingId: formData.get("listingId")?.toString() || undefined,
      contactId: formData.get("contactId")?.toString() || undefined,
    });
    if (!parsed.success) return validationError(parsed.error);

    const missing = await checkRefs(tenantId, [
      { table: deal, id: parsed.data.dealId, label: t("entityDeal") },
      { table: listing, id: parsed.data.listingId, label: t("entityListing") },
      { table: contact, id: parsed.data.contactId, label: t("entityContact") },
    ]);
    if (missing) return { success: false, message: t("notFoundInWorkspace", { entity: missing }) };

    return persistDocument(userId, tenantId, file, parsed.data);
  });
}

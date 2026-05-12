"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";

export async function addNote(
  entityType: "listing" | "contact" | "deal",
  entityId: string,
  content: string,
) {
  await logAudit("NOTE", entityType, entityId, { content });
  revalidatePath("/activity");
  return { success: true as const };
}

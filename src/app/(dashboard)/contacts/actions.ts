"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { contact } from "@/db/schema";
import { CONTACT_TYPES } from "@/lib/config";
import { db } from "@/lib/db";
import { requireDashboardAuth } from "@/lib/page-helpers";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  type: z.enum(CONTACT_TYPES).default("LEAD"),
});

export async function createContact(data: z.infer<typeof contactSchema>) {
  const { tenantId } = await requireDashboardAuth();
  const parsed = contactSchema.parse(data);

  const [created] = await db
    .insert(contact)
    .values({ ...parsed, tenantId })
    .returning();

  if (!created) throw new Error("Failed to create contact");

  revalidatePath("/contacts");
  return { success: true as const, contact: created };
}

export async function listContacts(limit = 20, offset = 0) {
  const { tenantId } = await requireDashboardAuth();

  const contacts = await db
    .select()
    .from(contact)
    .where(eq(contact.tenantId, tenantId))
    .orderBy(desc(contact.createdAt))
    .limit(limit)
    .offset(offset);

  return { success: true as const, contacts };
}

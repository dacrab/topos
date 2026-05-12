"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { contact } from "@/db/schema";
import { CONTACT_TYPES } from "@/lib/config";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  type: z.enum(CONTACT_TYPES).default("LEAD"),
});

export async function createContact(data: z.infer<typeof contactSchema>) {
  const tenant = await getCurrentTenant();
  const parsed = contactSchema.parse(data);

  const [created] = await db
    .insert(contact)
    .values({ ...parsed, tenantId: tenant.id })
    .returning();

  if (!created) throw new Error("Failed to create contact");

  revalidatePath("/contacts");
  return { success: true as const, contact: created };
}

export async function updateContact(id: string, data: z.infer<typeof contactSchema>) {
  const tenant = await getCurrentTenant();
  const parsed = contactSchema.parse(data);

  const [updated] = await db
    .update(contact)
    .set({ ...parsed, updatedAt: new Date() })
    .where(and(eq(contact.id, id), eq(contact.tenantId, tenant.id)))
    .returning();

  if (!updated) throw new Error("Contact not found or access denied");

  revalidatePath("/contacts");
  return { success: true as const, contact: updated };
}

export async function deleteContact(id: string) {
  const tenant = await getCurrentTenant();

  const [deleted] = await db
    .delete(contact)
    .where(and(eq(contact.id, id), eq(contact.tenantId, tenant.id)))
    .returning();

  if (!deleted) throw new Error("Contact not found or access denied");

  revalidatePath("/contacts");
  return { success: true as const };
}

export async function listContacts(limit = 20, offset = 0) {
  const tenant = await getCurrentTenant();

  const contacts = await db
    .select()
    .from(contact)
    .where(eq(contact.tenantId, tenant.id))
    .orderBy(desc(contact.createdAt))
    .limit(limit)
    .offset(offset);

  return { success: true as const, contacts };
}

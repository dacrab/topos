"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deal } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

const dealSchema = z.object({
  name: z.string().min(1, "Name is required"),
  stage: z.string().default("new"),
  status: z.string().default("active"),
  price: z.number().optional(),
  listingId: z.string().optional(),
  contactId: z.string().optional(),
  agentId: z.string().optional(),
});

export async function createDeal(data: z.infer<typeof dealSchema>) {
  const tenant = await getCurrentTenant();
  const parsed = dealSchema.parse(data);

  const [created] = await db
    .insert(deal)
    .values({ ...parsed, tenantId: tenant.id })
    .returning();

  if (!created) throw new Error("Failed to create deal");

  revalidatePath("/transactions");
  return { success: true as const, deal: created };
}

export async function updateDeal(id: string, data: Partial<z.infer<typeof dealSchema>>) {
  const tenant = await getCurrentTenant();

  const [updated] = await db
    .update(deal)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(deal.id, id), eq(deal.tenantId, tenant.id)))
    .returning();

  if (!updated) throw new Error("Deal not found or access denied");

  revalidatePath("/transactions");
  return { success: true as const, deal: updated };
}

export async function deleteDeal(id: string) {
  const tenant = await getCurrentTenant();

  const [deleted] = await db
    .delete(deal)
    .where(and(eq(deal.id, id), eq(deal.tenantId, tenant.id)))
    .returning();

  if (!deleted) throw new Error("Deal not found or access denied");

  revalidatePath("/transactions");
  return { success: true as const };
}

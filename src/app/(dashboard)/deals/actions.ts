"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deal } from "@/db/schema";
import { DEAL_STAGES, DEAL_STATUSES } from "@/lib/config";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

const dealSchema = z.object({
  name: z.string().min(1),
  stage: z.enum(DEAL_STAGES).default("new"),
  status: z.enum(DEAL_STATUSES).default("active"),
  price: z.number().optional(),
  commission: z.number().optional(),
  commissionRate: z.number().optional(),
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
  revalidatePath("/deals");
  return { success: true as const, deal: created };
}

export async function updateDeal(id: string, data: Partial<z.infer<typeof dealSchema>>) {
  const tenant = await getCurrentTenant();
  const [updated] = await db
    .update(deal)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(deal.id, id), eq(deal.tenantId, tenant.id)))
    .returning();
  if (!updated) throw new Error("Deal not found");
  revalidatePath("/deals");
  return { success: true as const, deal: updated };
}

export async function updateDealStage(id: string, stage: (typeof DEAL_STAGES)[number]) {
  const tenant = await getCurrentTenant();
  const updates: Record<string, unknown> = { stage, updatedAt: new Date() };
  if (stage === "closed_won") updates.closedAt = new Date();
  const [updated] = await db
    .update(deal)
    .set(updates)
    .where(and(eq(deal.id, id), eq(deal.tenantId, tenant.id)))
    .returning();
  if (!updated) throw new Error("Deal not found");
  revalidatePath("/deals");
  return { success: true as const, deal: updated };
}

export async function deleteDeal(id: string) {
  const tenant = await getCurrentTenant();
  const [deleted] = await db
    .delete(deal)
    .where(and(eq(deal.id, id), eq(deal.tenantId, tenant.id)))
    .returning();
  if (!deleted) throw new Error("Deal not found");
  revalidatePath("/deals");
  return { success: true as const };
}

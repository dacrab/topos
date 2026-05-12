"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { transactionPipeline } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

const transactionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  stages: z.array(z.object({ name: z.string(), order: z.number() })),
});

export async function createTransaction(data: z.infer<typeof transactionSchema>) {
  const tenant = await getCurrentTenant();
  const parsed = transactionSchema.parse(data);

  const [created] = await db
    .insert(transactionPipeline)
    .values({ ...parsed, tenantId: tenant.id })
    .returning();

  if (!created) throw new Error("Failed to create transaction");

  revalidatePath("/transactions");
  return { success: true as const, transaction: created };
}

export async function updateTransaction(id: string, data: z.infer<typeof transactionSchema>) {
  const tenant = await getCurrentTenant();
  const parsed = transactionSchema.parse(data);

  const [updated] = await db
    .update(transactionPipeline)
    .set({ ...parsed, updatedAt: new Date() })
    .where(and(eq(transactionPipeline.id, id), eq(transactionPipeline.tenantId, tenant.id)))
    .returning();

  if (!updated) throw new Error("Transaction not found or access denied");

  revalidatePath("/transactions");
  return { success: true as const, transaction: updated };
}

export async function deleteTransaction(id: string) {
  const tenant = await getCurrentTenant();

  const [deleted] = await db
    .delete(transactionPipeline)
    .where(and(eq(transactionPipeline.id, id), eq(transactionPipeline.tenantId, tenant.id)))
    .returning();

  if (!deleted) throw new Error("Transaction not found or access denied");

  revalidatePath("/transactions");
  return { success: true as const };
}

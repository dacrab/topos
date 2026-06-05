"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { commission } from "@/db/schema";
import { COMMISSION_TYPES } from "@/lib/config";
import { db } from "@/lib/db";
import { requireDashboardAuth } from "@/lib/page-helpers";

const commissionSchema = z.object({
  dealId: z.string().min(1),
  agentId: z.string().min(1),
  amount: z.number().optional(),
  rate: z.number().optional(),
  type: z.enum(COMMISSION_TYPES),
});

export async function createCommission(data: z.infer<typeof commissionSchema>) {
  const { tenantId } = await requireDashboardAuth();
  const parsed = commissionSchema.parse(data);
  const [created] = await db
    .insert(commission)
    .values({ ...parsed, tenantId })
    .returning();
  revalidatePath("/commissions");
  return { success: true as const, commission: created };
}

export async function markCommissionPaid(id: string) {
  const { tenantId } = await requireDashboardAuth();
  const [updated] = await db
    .update(commission)
    .set({ status: "paid", paidAt: new Date() })
    .where(and(eq(commission.id, id), eq(commission.tenantId, tenantId)))
    .returning();
  if (!updated) throw new Error("Commission not found");
  revalidatePath("/commissions");
  return { success: true as const, commission: updated };
}

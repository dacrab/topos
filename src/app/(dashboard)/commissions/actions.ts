"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { agent, commission, deal } from "@/db/schema";
import { type COMMISSION_STATUSES, COMMISSION_TYPES } from "@/lib/config";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

const commissionSchema = z.object({
  dealId: z.string().min(1),
  agentId: z.string().min(1),
  amount: z.number().optional(),
  rate: z.number().optional(),
  type: z.enum(COMMISSION_TYPES),
});

export async function createCommission(data: z.infer<typeof commissionSchema>) {
  const tenant = await getCurrentTenant();
  const parsed = commissionSchema.parse(data);
  const [created] = await db
    .insert(commission)
    .values({ ...parsed, tenantId: tenant.id })
    .returning();
  revalidatePath("/commissions");
  return { success: true as const, commission: created };
}

export async function markCommissionPaid(id: string) {
  const tenant = await getCurrentTenant();
  const [updated] = await db
    .update(commission)
    .set({ status: "paid", paidAt: new Date() })
    .where(and(eq(commission.id, id), eq(commission.tenantId, tenant.id)))
    .returning();
  if (!updated) throw new Error("Commission not found");
  revalidatePath("/commissions");
  return { success: true as const, commission: updated };
}

export async function listCommissions(filters?: { status?: (typeof COMMISSION_STATUSES)[number] }) {
  const tenant = await getCurrentTenant();
  const conditions = [eq(commission.tenantId, tenant.id)];
  if (filters?.status) conditions.push(eq(commission.status, filters.status));

  return db
    .select({
      id: commission.id,
      amount: commission.amount,
      rate: commission.rate,
      type: commission.type,
      status: commission.status,
      paidAt: commission.paidAt,
      createdAt: commission.createdAt,
      agentName: agent.name,
      dealName: deal.name,
    })
    .from(commission)
    .leftJoin(agent, eq(commission.agentId, agent.id))
    .leftJoin(deal, eq(commission.dealId, deal.id))
    .where(and(...conditions));
}

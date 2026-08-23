"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { commission, deal, teamMember } from "@/db/schema";
import { withTenant } from "@/lib/action-wrapper";
import { logAudit, refExists } from "@/lib/activity";
import { COMMISSION_TYPES } from "@/lib/config";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/types";
import { validationError } from "@/lib/validation";

const commissionSchema = z.object({
  dealId: z.string().min(1),
  agentId: z.string().min(1),
  amount: z.number().optional(),
  type: z.enum(COMMISSION_TYPES),
});

export async function createCommission(
  data: z.infer<typeof commissionSchema>,
): Promise<ActionResult> {
  return withTenant(async ({ tenantId }) => {
    const parsed = commissionSchema.safeParse(data);
    if (!parsed.success) return validationError(parsed.error);
    const v = parsed.data;

    if (!(await refExists(deal, deal.id, deal.tenantId, v.dealId, tenantId)))
      return { success: false, message: "Deal not found in this workspace" };
    if (!(await refExists(teamMember, teamMember.id, teamMember.tenantId, v.agentId, tenantId)))
      return { success: false, message: "Agent not found in this workspace" };

    const [created] = await db
      .insert(commission)
      .values({ ...v, tenantId })
      .returning();

    await logAudit({ tenantId, action: "CREATE", entity: "commission", entityId: created?.id });
    revalidatePath("/commissions");
    return { success: true, message: "Commission recorded", commission: created };
  });
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { contact, deal, listing, teamMember } from "@/db/schema";
import { actionMessages } from "@/lib/action-messages";
import { withTenant } from "@/lib/action-wrapper";
import { checkRefs, logActivity, logAudit } from "@/lib/activity";
import { DEAL_STATUSES } from "@/lib/config";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/types";
import { validationError } from "@/lib/validation";
import { dispatchWebhook } from "@/lib/webhook";

const dealSchema = z.object({
  name: z.string().min(1),
  stage: z.string().min(1).max(60).default("new"),
  status: z.enum(DEAL_STATUSES).default("active"),
  price: z.number().optional(),
  commission: z.number().optional(),
  listingId: z.string().optional(),
  contactId: z.string().optional(),
  agentId: z.string().optional(),
});

export async function createDeal(data: z.input<typeof dealSchema>): Promise<ActionResult> {
  return withTenant(async ({ tenantId }) => {
    const t = await actionMessages();
    const parsed = dealSchema.safeParse(data);
    if (!parsed.success) return validationError(parsed.error);
    const v = parsed.data;

    const missing = await checkRefs(tenantId, [
      { table: listing, id: v.listingId, label: t("entityListing") },
      { table: contact, id: v.contactId, label: t("entityContact") },
      { table: teamMember, id: v.agentId, label: t("entityAgent") },
    ]);
    if (missing) return { success: false, message: t("notFoundInWorkspace", { entity: missing }) };

    const [created] = await db
      .insert(deal)
      .values({ ...v, tenantId })
      .returning();

    await logActivity({
      tenantId,
      type: "DEAL_CREATED",
      title: `Deal created: ${v.name}`,
    });
    await logAudit({ tenantId, action: "CREATE", entity: "deal", entityId: created?.id });
    await dispatchWebhook(tenantId, "deal.created", {
      id: created?.id,
      name: created?.name,
      stage: created?.stage,
    });

    revalidatePath("/deals");
    return { success: true, message: t("dealCreated"), deal: created };
  });
}

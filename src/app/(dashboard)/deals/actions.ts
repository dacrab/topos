"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { contact, deal, listing, teamMember } from "@/db/schema";
import { withTenant } from "@/lib/action-wrapper";
import { logActivity, logAudit, refExists } from "@/lib/activity";
import { DEAL_STAGES, DEAL_STATUSES } from "@/lib/config";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/types";
import { validationError } from "@/lib/validation";
import { dispatchWebhook } from "@/lib/webhook";

const dealSchema = z.object({
  name: z.string().min(1),
  stage: z.enum(DEAL_STAGES).default("new"),
  status: z.enum(DEAL_STATUSES).default("active"),
  price: z.number().optional(),
  commission: z.number().optional(),
  listingId: z.string().optional(),
  contactId: z.string().optional(),
  agentId: z.string().optional(),
});

export async function createDeal(data: z.input<typeof dealSchema>): Promise<ActionResult> {
  return withTenant(async ({ tenantId }) => {
    const parsed = dealSchema.safeParse(data);
    if (!parsed.success) return validationError(parsed.error);
    const v = parsed.data;

    if (
      v.listingId &&
      !(await refExists(listing, listing.id, listing.tenantId, v.listingId, tenantId))
    )
      return { success: false, message: "Listing not found in this workspace" };
    if (
      v.contactId &&
      !(await refExists(contact, contact.id, contact.tenantId, v.contactId, tenantId))
    )
      return { success: false, message: "Contact not found in this workspace" };
    if (
      v.agentId &&
      !(await refExists(teamMember, teamMember.id, teamMember.tenantId, v.agentId, tenantId))
    )
      return { success: false, message: "Agent not found in this workspace" };

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
    return { success: true, message: "Deal created", deal: created };
  });
}

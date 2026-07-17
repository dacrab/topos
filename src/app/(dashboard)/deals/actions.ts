"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deal } from "@/db/schema";
import { DEAL_STAGES, DEAL_STATUSES } from "@/lib/config";
import { db } from "@/lib/db";
import { requireDashboardAuth } from "@/lib/page-helpers";

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

export async function createDeal(data: z.infer<typeof dealSchema>) {
  const { tenantId } = await requireDashboardAuth();
  const parsed = dealSchema.parse(data);
  const [created] = await db
    .insert(deal)
    .values({ ...parsed, tenantId })
    .returning();
  revalidatePath("/deals");
  return { success: true as const, deal: created };
}

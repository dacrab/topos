"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { tenant } from "@/db/schema";
import { withTenant } from "@/lib/action-wrapper";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/types";
import { pipelineStagesSchema, validationError } from "@/lib/validation";

export async function savePipelineTemplate(stages: unknown): Promise<ActionResult> {
  return withTenant(async ({ tenantId }) => {
    const parsed = pipelineStagesSchema.safeParse(stages);
    if (!parsed.success) return validationError(parsed.error);

    await db.update(tenant).set({ pipelineStages: parsed.data }).where(eq(tenant.id, tenantId));
    revalidatePath("/settings/pipeline");
    return { success: true, message: "Pipeline saved" };
  });
}

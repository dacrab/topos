"use server";

import { eq } from "drizzle-orm";
import { pipelineTemplate } from "@/db/schema";
import { DEAL_STAGES } from "@/lib/config";
import { db } from "@/lib/db";
import { requireDashboardAuth } from "@/lib/page-helpers";

export async function getPipelineTemplate() {
  const { tenantId } = await requireDashboardAuth();
  const [template] = await db
    .select()
    .from(pipelineTemplate)
    .where(eq(pipelineTemplate.tenantId, tenantId))
    .limit(1);

  if (template) return template.stages;
  return DEAL_STAGES.map((name, i) => ({ name, order: i }));
}

export async function savePipelineTemplate(stages: { name: string; order: number }[]) {
  const { tenantId } = await requireDashboardAuth();
  const [existing] = await db
    .select()
    .from(pipelineTemplate)
    .where(eq(pipelineTemplate.tenantId, tenantId))
    .limit(1);

  if (existing) {
    await db
      .update(pipelineTemplate)
      .set({ stages, name: "Custom Pipeline" })
      .where(eq(pipelineTemplate.id, existing.id));
  } else {
    await db.insert(pipelineTemplate).values({
      name: "Custom Pipeline",
      stages,
      tenantId,
    });
  }
}

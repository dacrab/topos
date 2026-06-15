"use server";

import { eq } from "drizzle-orm";
import { tenant } from "@/db/schema";
import { DEAL_STAGES } from "@/lib/config";
import { db } from "@/lib/db";
import { requireDashboardAuth } from "@/lib/page-helpers";

export async function getPipelineTemplate() {
  const { tenantId } = await requireDashboardAuth();
  const [template] = await db.select().from(tenant).where(eq(tenant.id, tenantId)).limit(1);

  if (template?.pipelineStages) return template.pipelineStages;
  return DEAL_STAGES.map((name, i) => ({ name, order: i }));
}

export async function savePipelineTemplate(stages: { name: string; order: number }[]) {
  const { tenantId } = await requireDashboardAuth();

  await db.update(tenant).set({ pipelineStages: stages }).where(eq(tenant.id, tenantId));
}

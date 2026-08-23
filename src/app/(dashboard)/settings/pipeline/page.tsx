import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { SectionHeader } from "@/components/ui/page";
import { tenant } from "@/db/schema";
import { requireTenant } from "@/lib/action-wrapper";
import { DEAL_STAGES } from "@/lib/config";
import { db } from "@/lib/db";
import { PipelineEditor } from "./editor";

export default async function PipelineSettingsPage() {
  const t = await getTranslations("Pipeline");
  const { tenantId } = await requireTenant();

  const [row] = await db
    .select({ pipelineStages: tenant.pipelineStages })
    .from(tenant)
    .where(eq(tenant.id, tenantId))
    .limit(1);

  const stages = row?.pipelineStages ?? DEAL_STAGES.map((name, i) => ({ name, order: i }));

  return (
    <div className="space-y-6">
      <SectionHeader title={t("title")} description={t("subtitle")} />
      <PipelineEditor initialStages={stages} />
    </div>
  );
}

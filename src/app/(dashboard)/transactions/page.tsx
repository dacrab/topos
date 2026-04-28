import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { SectionHeader } from "@/components/ui/page";
import { transactionPipeline } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

export default async function TransactionsPage() {
  const t = await getTranslations("Transactions");
  const tenant = await getCurrentTenant();

  const pipeline = await db
    .select()
    .from(transactionPipeline)
    .where(eq(transactionPipeline.tenantId, tenant.id))
    .limit(1)
    .then(r => r[0]);

  const defaultStageKeys = ["stageNew", "stageContacted", "stageViewing", "stageOffer", "stageClosed"] as const;
  const stages = (pipeline?.stages as string[] | null) ?? defaultStageKeys.map((key) => t(key));

  return (
    <div className="space-y-6">
      <SectionHeader title={t("title")} description={t("subtitle")} />

      {!pipeline && (
        <div className="border border-dashed border-border/60 p-6 text-sm text-muted-foreground bg-muted/5">
          {t("noPipelineConfigured")} {t("pipelineComingSoon")}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-5 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div
            key={stage}
            className="border border-border/60 bg-card p-4 flex flex-col gap-3 min-h-[200px] min-w-[200px] hover:shadow-sm transition-all"
          >
            <div className="font-bold text-xs uppercase tracking-widest text-foreground border-b border-border/40 pb-2">
              {stage}
            </div>
            <div className="text-xs text-muted-foreground flex-1 flex items-center justify-center text-center italic p-4 bg-muted/10 border border-dashed border-border/40">
              {t("noDeals")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

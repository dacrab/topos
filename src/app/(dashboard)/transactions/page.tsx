import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SectionHeader } from "@/components/ui/page";
import { deal } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Transactions" };

const DEAL_STAGES = [
  "new",
  "contacted",
  "viewing",
  "offer",
  "negotiation",
  "closed_won",
  "closed_lost",
] as const;

export default async function TransactionsPage() {
  const t = await getTranslations("Transactions");
  const tenant = await getCurrentTenant();

  const deals = await db.select().from(deal).where(eq(deal.tenantId, tenant.id));

  return (
    <div className="space-y-6">
      <SectionHeader title={t("title")} description={t("subtitle")} />

      <div className="grid gap-4 md:grid-cols-5 overflow-x-auto pb-4">
        {DEAL_STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage);
          return (
            <div
              key={stage}
              className="border border-border/60 bg-card p-4 flex flex-col gap-3 min-h-[200px] min-w-[200px] hover:shadow-sm transition-all"
            >
              <div className="font-bold text-xs uppercase tracking-widest text-foreground border-b border-border/40 pb-2">
                {stage.replace("_", " ")}
              </div>
              {stageDeals.length === 0 ? (
                <div className="text-xs text-muted-foreground flex-1 flex items-center justify-center text-center italic p-4 bg-muted/10 border border-dashed border-border/40">
                  {t("noDeals")}
                </div>
              ) : (
                stageDeals.map((d) => (
                  <div key={d.id} className="text-sm border border-border/40 p-2 bg-background">
                    {d.name}
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

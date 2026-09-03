import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NewDealForm } from "@/components/dashboard/NewDealForm";
import { SectionHeader } from "@/components/ui/page";
import { contact, deal, teamMember, user } from "@/db/schema";
import { requireTenant } from "@/lib/action-wrapper";
import { DEAL_STAGES } from "@/lib/config";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Deals");
  return { title: t("title") };
}

export default async function DealsPage() {
  const t = await getTranslations("Deals");
  const { tenantId } = await requireTenant();

  const deals = await db
    .select({
      id: deal.id,
      name: deal.name,
      stage: deal.stage,
      price: deal.price,
      contactName: contact.firstName,
      agentName: user.name,
    })
    .from(deal)
    .leftJoin(contact, eq(deal.contactId, contact.id))
    .leftJoin(teamMember, eq(deal.agentId, teamMember.id))
    .leftJoin(user, eq(teamMember.userId, user.id))
    .where(eq(deal.tenantId, tenantId))
    .limit(50);

  return (
    <div className="space-y-6">
      <SectionHeader title={t("title")} description={t("subtitle")}>
        <NewDealForm />
      </SectionHeader>
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7 overflow-x-auto pb-4">
        {DEAL_STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage);
          return (
            <div
              key={stage}
              className="border border-border/80 bg-muted/30 flex flex-col min-h-[200px] min-w-[180px] rounded-xl overflow-hidden"
            >
              <div className="p-3 flex items-center justify-between border-b border-border/80 bg-card">
                <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  {stage.replace(/_/g, " ")}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {stageDeals.length}
                </span>
              </div>
              <div className="p-3 flex flex-col gap-2">
                {stageDeals.length === 0 ? (
                  <div className="text-xs text-muted-foreground/60 flex-1 flex items-center justify-center italic py-6">
                    {t("noDeals")}
                  </div>
                ) : (
                  stageDeals.map((d) => (
                    <div
                      key={d.id}
                      className="card-base text-sm p-3 space-y-1.5 rounded-lg hover:border-primary/30 transition-colors"
                    >
                      <div className="font-medium">{d.name}</div>
                      {d.price != null && (
                        <div className="text-xs text-muted-foreground tabular-nums">
                          {formatCurrency(d.price)}
                        </div>
                      )}
                      {d.contactName && (
                        <div className="text-xs text-muted-foreground">{d.contactName}</div>
                      )}
                      {d.agentName && (
                        <div className="text-xs text-muted-foreground">{d.agentName}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

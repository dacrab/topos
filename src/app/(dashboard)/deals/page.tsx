import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NewDealForm } from "@/components/dashboard/NewDealForm";
import { ArchTopBar } from "@/components/ui/arch-top";
import { SectionHeader } from "@/components/ui/page";
import { contact, deal, teamMember, user } from "@/db/schema";
import { DEAL_STAGES } from "@/lib/config";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { requireDashboardAuth } from "@/lib/page-helpers";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Deals");
  return { title: t("title") };
}

const PAGE_SIZE = 50;

export default async function DealsPage() {
  const t = await getTranslations("Deals");
  const { tenantId } = await requireDashboardAuth();

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
    .limit(PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader title={t("title")} description={t("subtitle")} />
        <NewDealForm />
      </div>
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7 overflow-x-auto pb-4">
        {DEAL_STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage);
          return (
            <div
              key={stage}
              className="border border-border/40 bg-muted/30 flex flex-col gap-3 min-h-[200px] min-w-[180px] rounded-2xl overflow-hidden"
            >
              <ArchTopBar className="h-2" />
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                  <span className="font-semibold text-xs text-foreground tracking-wider">
                    {stage.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-muted-foreground">({stageDeals.length})</span>
                </div>
                {stageDeals.length === 0 ? (
                  <div className="text-xs text-muted-foreground flex-1 flex items-center justify-center italic">
                    {t("noDeals")}
                  </div>
                ) : (
                  stageDeals.map((d) => (
                    <div
                      key={d.id}
                      className="text-sm border border-border/40 p-3 bg-card space-y-1.5 rounded-2xl shadow-card"
                    >
                      <div className="font-medium">{d.name}</div>
                      {d.price && (
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

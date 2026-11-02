import { eq } from "drizzle-orm";
import { Briefcase, Columns3, DollarSign, Handshake, UserRound } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { NewDealForm } from "@/components/dashboard/NewDealForm";
import { EmptyState, SectionHeader } from "@/components/ui/page";
import { StatCard } from "@/components/ui/stat";
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
  const locale = await getLocale();
  const { tenantId, tenant } = await requireTenant();

  const stages = (tenant.pipelineStages ?? DEAL_STAGES.map((name, i) => ({ name, order: i })))
    .slice()
    .sort((a, b) => a.order - b.order);

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
    .limit(200);

  const totalValue = deals.reduce((sum, item) => sum + (item.price ?? 0), 0);

  return (
    <div className="space-y-8">
      <SectionHeader title={t("title")} description={t("subtitle")}>
        <NewDealForm stages={stages} />
      </SectionHeader>

      {deals.length === 0 ? (
        <EmptyState icon={<Handshake className="h-5 w-5" />}>{t("noDeals")}</EmptyState>
      ) : (
        <>
          <div className="grid gap-px border-y border-border bg-border sm:grid-cols-3">
            <StatCard
              title={t("pipelineValue")}
              value={formatCurrency(totalValue, false, locale)}
              icon={DollarSign}
            />
            <StatCard title={t("totalDeals")} value={deals.length} icon={Handshake} />
            <StatCard title={t("stages")} value={stages.length} icon={Columns3} />
          </div>

          <div className="overflow-x-auto">
            <div className="flex min-w-max border-t border-border">
              {stages.map((stage, index) => {
                const stageDeals = deals.filter((d) => d.stage === stage.name);
                return (
                  <div
                    key={stage.name}
                    className="flex w-[17.5rem] shrink-0 flex-col border-l border-border first:border-l-0"
                  >
                    <div className="border-b border-border px-4 pt-4">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="index-caps">{String(index + 1).padStart(2, "0")}</span>
                        <span className="font-mono text-micro text-muted-foreground tabular-nums">
                          {String(stageDeals.length).padStart(2, "0")}
                        </span>
                      </div>
                      <h2 className="mt-2 truncate pb-2 font-display text-lg capitalize leading-tight tracking-[-0.01em]">
                        {stage.name.replace(/_/g, " ").toLowerCase()}
                      </h2>
                    </div>

                    <div className="flex flex-1 flex-col">
                      {stageDeals.length === 0 ? (
                        <div className="flex flex-1 items-center justify-center border-b border-border px-4 py-10">
                          <span className="meta-caps text-muted-foreground/50">—</span>
                        </div>
                      ) : (
                        stageDeals.map((d) => (
                          <article
                            key={d.id}
                            className="group border-b border-border px-4 py-3.5 transition-colors hover:bg-muted/40"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="text-sm font-medium leading-snug text-foreground">
                                {d.name}
                              </h3>
                              {d.price != null && (
                                <span className="shrink-0 font-display text-sm tabular-nums text-accent">
                                  {formatCurrency(d.price, false, locale)}
                                </span>
                              )}
                            </div>
                            {(d.contactName || d.agentName) && (
                              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 micro-caps text-muted-foreground">
                                {d.contactName && (
                                  <span className="flex items-center gap-1">
                                    <UserRound className="h-2.5 w-2.5" />
                                    {d.contactName}
                                  </span>
                                )}
                                {d.agentName && (
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="h-2.5 w-2.5" />
                                    {d.agentName}
                                  </span>
                                )}
                              </div>
                            )}
                          </article>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { count, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import {
  CancelSubscriptionForm,
  ManageBillingBtn,
  PlanCard,
} from "@/components/settings/BillingForms";
import { SectionHeader } from "@/components/ui/page";
import { UsageStat } from "@/components/ui/stat";
import { listing, teamMember, tenant as tenantTable } from "@/db/schema";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { requireDashboardAuth } from "@/lib/page-helpers";
import { getPlan, PLANS } from "@/lib/plans";

export default async function BillingSettingsPage() {
  const t = await getTranslations("Settings");
  const tb = await getTranslations("Billing");
  const { tenant } = await requireDashboardAuth();

  const [[sub], [listingCount], [memberCount]] = await Promise.all([
    db.select().from(tenantTable).where(eq(tenantTable.id, tenant.id)).limit(1),
    db.select({ count: count() }).from(listing).where(eq(listing.tenantId, tenant.id)),
    db.select({ count: count() }).from(teamMember).where(eq(teamMember.tenantId, tenant.id)),
  ]);

  const plan = getPlan(sub?.plan ?? "free");
  const listingsUsed = listingCount?.count ?? 0;
  const membersUsed = memberCount?.count ?? 0;
  const listingsLimit = plan.limits.listings;

  return (
    <>
      <SectionHeader title={t("billingTitle")} description={t("billingDesc")} />
      <div className="border border-border/40 bg-card shadow-card rounded-2xl overflow-hidden">
        <div className="h-2 bg-primary/5 arch-top" />
        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="label-caps mb-1">{t("currentPlan")}</p>
              <p className="text-2xl font-display font-semibold tracking-tight">
                {t(plan.nameKey)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {tenant.name} &middot; {sub?.status ?? "active"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {sub?.polarCustomerId && <ManageBillingBtn />}
              <div className="text-right">
                <span className="text-3xl font-display font-semibold tabular-nums">
                  {plan.price > 0 ? formatCurrency(plan.price) : t("free")}
                </span>
                <span className="text-muted-foreground text-sm">/{tb("month")}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border/40">
            <UsageStat
              label={t("listingsUsed")}
              value={`${listingsUsed} / ${listingsLimit === -1 ? "∞" : listingsLimit}`}
            />
            <UsageStat
              label={t("teamMembers")}
              value={`${membersUsed} / ${plan.limits.teamMembers === -1 ? "∞" : plan.limits.teamMembers}`}
            />
            <UsageStat label={t("billingCycle")} value={t("monthly")} />
            <UsageStat
              label={t("nextBilling")}
              value={sub?.currentPeriodEnd ? formatDate(sub.currentPeriodEnd) : "N/A"}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <h3 className="text-sm text-muted-foreground font-medium">{t("availablePlans")}</h3>
          <div className="flex-1 h-px bg-border/40" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              currentPlan={plan.id}
              hasPolarCustomer={!!sub?.polarCustomerId}
            />
          ))}
        </div>
      </div>

      <CancelSubscriptionForm currentPlan={plan.id} />
    </>
  );
}

import { count, eq } from "drizzle-orm";
import { CreditCard } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import {
  CancelSubscriptionForm,
  ManageBillingBtn,
  PlanCard,
} from "@/components/settings/BillingForms";
import { DividerHeading, Panel, SectionHeader } from "@/components/ui/page";
import { UsageStat } from "@/components/ui/stat";
import { listing, teamMember, tenant as tenantTable } from "@/db/schema";
import { requireTenant } from "@/lib/action-wrapper";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { getPlan, PLANS } from "@/lib/plans";

export default async function BillingSettingsPage() {
  const t = await getTranslations("Settings");
  const tb = await getTranslations("Billing");
  const locale = await getLocale();
  const { tenant } = await requireTenant();

  const [[sub], [listingCount], [memberCount]] = await Promise.all([
    db.select().from(tenantTable).where(eq(tenantTable.id, tenant.id)).limit(1),
    db.select({ count: count() }).from(listing).where(eq(listing.tenantId, tenant.id)),
    db.select({ count: count() }).from(teamMember).where(eq(teamMember.tenantId, tenant.id)),
  ]);

  const plan = getPlan(sub?.plan ?? "free");
  const listingsUsed = listingCount?.count ?? 0;
  const membersUsed = memberCount?.count ?? 0;
  const listingsLimit = plan.limits.listings;
  const membersLimit = plan.limits.teamMembers;

  const percent = (used: number, limit: number) =>
    limit === -1 ? undefined : Math.round((used / limit) * 100);

  return (
    <div className="space-y-8">
      <SectionHeader title={t("billingTitle")} description={t("billingDesc")} />

      <Panel
        title={tb(plan.nameKey)}
        description={`${tenant.name} · ${sub?.status ?? "active"}`}
        icon={<CreditCard className="h-4 w-4" />}
        action={sub?.polarCustomerId ? <ManageBillingBtn /> : null}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label-caps mb-2">{tb("currentPlan")}</p>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl leading-none tracking-[-0.03em] tabular-nums">
                {plan.price > 0 ? formatCurrency(plan.price, false, locale) : tb("freeName")}
              </span>
              {plan.price > 0 && (
                <span className="meta-caps text-muted-foreground">/{tb("month")}</span>
              )}
            </div>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">{tb(plan.descriptionKey)}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 border-t border-border pt-6 sm:grid-cols-4">
          <UsageStat
            label={t("listingsUsed")}
            value={`${listingsUsed} / ${listingsLimit === -1 ? "∞" : listingsLimit}`}
            {...(percent(listingsUsed, listingsLimit) !== undefined
              ? { progress: percent(listingsUsed, listingsLimit) }
              : {})}
          />
          <UsageStat
            label={t("teamMembers")}
            value={`${membersUsed} / ${membersLimit === -1 ? "∞" : membersLimit}`}
            {...(percent(membersUsed, membersLimit) !== undefined
              ? { progress: percent(membersUsed, membersLimit) }
              : {})}
          />
          <UsageStat label={t("billingCycle")} value={t("monthly")} />
          <UsageStat
            label={t("nextBilling")}
            value={sub?.currentPeriodEnd ? formatDate(sub.currentPeriodEnd, locale) : "—"}
          />
        </div>
      </Panel>

      <div className="space-y-4">
        <DividerHeading title={t("availablePlans")} />
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <PlanCard key={p.id} plan={p} currentPlan={plan.id} />
          ))}
        </div>
      </div>

      <CancelSubscriptionForm currentPlan={plan.id} />
    </div>
  );
}

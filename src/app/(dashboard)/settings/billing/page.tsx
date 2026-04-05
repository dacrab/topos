import { count, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { CancelSubscriptionForm, PlanCard } from "@/components/settings/BillingForms";
import { SettingsPageSection } from "@/components/ui/page";
import { UsageStat } from "@/components/ui/stat";
import { listing, subscription, teamMember } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";
import { getPlan, PLANS } from "@/lib/plans";

export default async function BillingSettingsPage() {
  const t = await getTranslations("Settings");
  const tenant = await getCurrentTenant();

  const [[sub], [listingCount], [memberCount]] = await Promise.all([
    db.select().from(subscription).where(eq(subscription.tenantId, tenant.id)).limit(1),
    db.select({ count: count() }).from(listing).where(eq(listing.tenantId, tenant.id)),
    db.select({ count: count() }).from(teamMember).where(eq(teamMember.tenantId, tenant.id)),
  ]);

  const currentPlan = sub?.plan ?? "free";
  const currentPlanData = getPlan(currentPlan);
  const listingsUsed = listingCount?.count ?? 0;
  const membersUsed = memberCount?.count ?? 0;
  const listingsLimit = currentPlanData.limits.listings;
  const atLimit = listingsLimit !== -1 && listingsUsed >= listingsLimit;
  const nearLimit = listingsLimit !== -1 && listingsUsed >= listingsLimit * 0.8 && !atLimit;

  return (
    <SettingsPageSection title={t("billingTitle")} description={t("billingDesc")}>
      <div className="section-box space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="label-caps mb-1">{t("currentPlan")}</p>
            <p className="text-2xl font-bold">{t(currentPlanData.nameKey)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {tenant.name} • {sub?.status ?? "active"}
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-mono font-bold">${currentPlanData.price}</span>
            <span className="text-muted-foreground text-sm">/mo</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border">
          <UsageStat
            label={t("listingsUsed")}
            value={`${listingsUsed} / ${listingsLimit === -1 ? "∞" : listingsLimit}`}
            {...(nearLimit ? { warning: t("nearLimit") } : {})}
            {...(atLimit ? { error: t("limitReached") } : {})}
          />
          <UsageStat
            label={t("teamMembers")}
            value={`${membersUsed} / ${currentPlanData.limits.teamMembers === -1 ? "∞" : currentPlanData.limits.teamMembers}`}
          />
          <UsageStat label={t("billingCycle")} value={t("monthly")} />
          <UsageStat
            label={t("nextBilling")}
            value={
              sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : "N/A"
            }
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="section-title">{t("availablePlans")}</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlan={currentPlan}
              currentPrice={currentPlanData.price}
            />
          ))}
        </div>
      </div>

      <CancelSubscriptionForm currentPlan={currentPlan} />
    </SettingsPageSection>
  );
}

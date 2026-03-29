import { count, eq } from "drizzle-orm";
import { CreditCard, Zap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { CancelSubscriptionForm, PlanCard } from "@/components/settings/BillingForms";
import { SectionHeader, UsageStat } from "@/components/ui";
import { listing, subscription, teamMember } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";
import { getPlan, PLANS } from "@/lib/plans";

export const dynamic = "force-dynamic";

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

  const nearLimit =
    listingsLimit !== -1 && listingsUsed >= listingsLimit * 0.8 && listingsUsed < listingsLimit;
  const atLimit = listingsLimit !== -1 && listingsUsed >= listingsLimit;

  return (
    <div className="space-y-8">
      <SectionHeader bordered title={t("billingTitle")} description={t("billingDesc")} />

      <div className="section-box">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              {t("currentPlan")}
            </h3>
            <p className="text-2xl font-bold mt-1">{currentPlanData.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {tenant.name} • <span className="capitalize">{sub?.status ?? "active"}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-mono font-bold">${currentPlanData.price}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
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
        <h3 className="text-sm font-semibold border-b border-border pb-2">{t("availablePlans")}</h3>
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

      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">{t("paymentMethod")}</h3>
        {sub?.stripeCustomerId ? (
          <div className="border border-border p-4 flex items-center gap-3 text-muted-foreground">
            <CreditCard className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{t("managedViaStripe")}</p>
          </div>
        ) : (
          <div className="border border-dashed border-border p-8 text-center">
            <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">{t("noPaymentMethod")}</p>
            <p className="text-xs text-muted-foreground mt-2">{t("addPaymentMethodDesc")}</p>
            <button
              type="button"
              className="mt-4 border border-border px-6 py-2 font-bold uppercase tracking-widest text-xs hover:bg-secondary transition-colors"
            >
              {t("addPaymentMethod")}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">{t("billingHistory")}</h3>
        <div className="card-bordered">
          <div className="p-6 text-center text-muted-foreground">
            <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t("noBillingHistory")}</p>
            <p className="text-xs mt-1">{t("invoicesAppearHere")}</p>
          </div>
        </div>
      </div>

      <CancelSubscriptionForm currentPlan={currentPlan} />
    </div>
  );
}

import { count, eq } from "drizzle-orm";
import { CreditCard, Zap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import {
  CancelSubscriptionForm,
  PlanCard,
} from "@/components/settings/BillingForms";
import { listing, subscription } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";
import { getPlan, PLANS } from "@/lib/plans";

export const dynamic = "force-dynamic";

export default async function BillingSettingsPage() {
  const t = await getTranslations("Settings");
  const tenant = await getCurrentTenant();

  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.tenantId, tenant.id))
    .limit(1);
  const [listingCount] = await db
    .select({ count: count() })
    .from(listing)
    .where(eq(listing.tenantId, tenant.id));

  const currentPlan = sub?.plan || "free";
  const currentPlanData = getPlan(currentPlan);
  const listingsUsed = listingCount?.count || 0;
  const listingsLimit = currentPlanData.limits.listings;

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-bold tracking-tight">
          {t("billingTitle")}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{t("billingDesc")}</p>
      </div>

      {/* Current Plan */}
      <div className="border border-border p-6 bg-card">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              {t("currentPlan")}
            </h3>
            <p className="text-2xl font-bold mt-1">{currentPlanData.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {tenant.name} •{" "}
              <span className="capitalize">{sub?.status || "active"}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-mono font-bold">
              ${currentPlanData.price}
            </span>
            <span className="text-muted-foreground">/month</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <UsageStat
            label={t("listingsUsed")}
            value={`${listingsUsed} / ${listingsLimit === -1 ? "∞" : listingsLimit}`}
            warning={
              listingsLimit !== -1 &&
              listingsUsed >= listingsLimit * 0.8 &&
              listingsUsed < listingsLimit
                ? t("nearLimit")
                : undefined
            }
            error={
              listingsLimit !== -1 && listingsUsed >= listingsLimit
                ? t("limitReached")
                : undefined
            }
          />
          <UsageStat
            label={t("teamMembers")}
            value={`1 / ${currentPlanData.limits.teamMembers === -1 ? "∞" : currentPlanData.limits.teamMembers}`}
          />
          <UsageStat label={t("billingCycle")} value={t("monthly")} />
          <UsageStat
            label={t("nextBilling")}
            value={
              sub?.currentPeriodEnd
                ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                : "N/A"
            }
          />
        </div>
      </div>

      {/* Available Plans */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">
          {t("availablePlans")}
        </h3>

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

      {/* Payment Method */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">
          {t("paymentMethod")}
        </h3>

        {sub?.stripeCustomerId ? (
          <div className="border border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">
                  {t("expires")} 12/25
                </p>
              </div>
            </div>
            <button
              type="button"
              className="text-xs font-bold uppercase tracking-widest text-primary hover:underline"
            >
              {t("update")}
            </button>
          </div>
        ) : (
          <div className="border border-dashed border-border p-8 text-center">
            <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">{t("noPaymentMethod")}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {t("addPaymentMethodDesc")}
            </p>
            <button
              type="button"
              className="mt-4 border border-border px-6 py-2 font-bold uppercase tracking-widest text-xs hover:bg-secondary transition-colors"
            >
              {t("addPaymentMethod")}
            </button>
          </div>
        )}
      </div>

      {/* Billing History */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">
          {t("billingHistory")}
        </h3>

        <div className="border border-border bg-card">
          <div className="p-6 text-center text-muted-foreground">
            <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t("noBillingHistory")}</p>
            <p className="text-xs mt-1">{t("invoicesAppearHere")}</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <CancelSubscriptionForm currentPlan={currentPlan} />
    </div>
  );
}

function UsageStat({
  label,
  value,
  warning,
  error,
}: {
  label: string;
  value: string;
  warning?: string;
  error?: string;
}) {
  return (
    <div>
      <span className="text-muted-foreground block">{label}</span>
      <span className="font-mono font-bold">{value}</span>
      {warning && (
        <span className="text-yellow-500 text-xs block">{warning}</span>
      )}
      {error && <span className="text-red-500 text-xs block">{error}</span>}
    </div>
  );
}

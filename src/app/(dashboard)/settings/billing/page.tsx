import { count, eq } from "drizzle-orm";
import { CreditCard, Zap } from "lucide-react";
import {
  CancelSubscriptionForm,
  PlanCard,
} from "@/components/settings/BillingForms";
import { listing, subscription } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "For individuals getting started",
    features: [
      "Up to 5 listings",
      "Basic analytics",
      "Email support",
      "1 team member",
    ],
    limits: { listings: 5, teamMembers: 1 },
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    description: "For growing real estate businesses",
    features: [
      "Unlimited listings",
      "Advanced analytics",
      "Priority support",
      "5 team members",
      "Custom domain",
      "API access",
    ],
    limits: { listings: -1, teamMembers: 5 },
    recommended: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    description: "For large brokerages and agencies",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "White-label branding",
      "Dedicated support",
      "SLA guarantee",
      "Custom integrations",
    ],
    limits: { listings: -1, teamMembers: -1 },
  },
];

export default async function BillingSettingsPage() {
  const tenant = await getCurrentTenant();

  // Get subscription data
  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.tenantId, tenant.id))
    .limit(1);

  const currentPlan = sub?.plan || "free";
  const subscriptionStatus = sub?.status || "active";

  // Get usage stats
  const [listingCount] = await db
    .select({ count: count() })
    .from(listing)
    .where(eq(listing.tenantId, tenant.id));

  const currentPlanData = PLANS.find((p) => p.id === currentPlan) || PLANS[0];
  const listingsUsed = listingCount?.count || 0;
  const listingsLimit = currentPlanData.limits.listings;

  return (
    <div className="space-y-8">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-bold tracking-tight">Billing & Plans</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan */}
      <div className="border border-border p-6 bg-card">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Current Plan
            </h3>
            <p className="text-2xl font-bold mt-1">{currentPlanData.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {tenant.name} •{" "}
              <span className="capitalize">{subscriptionStatus}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-mono font-bold">
              ${currentPlanData.price}
            </span>
            <span className="text-muted-foreground">/month</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block">Listings used</span>
              <span className="font-mono font-bold">
                {listingsUsed} / {listingsLimit === -1 ? "∞" : listingsLimit}
              </span>
              {listingsLimit !== -1 &&
                listingsUsed >= listingsLimit * 0.8 &&
                listingsUsed < listingsLimit && (
                  <span className="text-yellow-500 text-xs block">
                    Near limit
                  </span>
                )}
              {listingsLimit !== -1 && listingsUsed >= listingsLimit && (
                <span className="text-red-500 text-xs block">
                  Limit reached
                </span>
              )}
            </div>
            <div>
              <span className="text-muted-foreground block">Team members</span>
              <span className="font-mono font-bold">
                1 /{" "}
                {currentPlanData.limits.teamMembers === -1
                  ? "∞"
                  : currentPlanData.limits.teamMembers}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Billing cycle</span>
              <span className="font-mono font-bold">Monthly</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Next billing</span>
              <span className="font-mono font-bold">
                {sub?.currentPeriodEnd
                  ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">
          Available Plans
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
          Payment Method
        </h3>

        {sub?.stripeCustomerId ? (
          <div className="border border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/25</p>
              </div>
            </div>
            <button
              type="button"
              className="text-xs font-bold uppercase tracking-widest text-primary hover:underline"
            >
              Update
            </button>
          </div>
        ) : (
          <div className="border border-dashed border-border p-8 text-center">
            <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No payment method on file</p>
            <p className="text-xs text-muted-foreground mt-2">
              Add a payment method to upgrade your plan
            </p>
            <button
              type="button"
              className="mt-4 border border-border px-6 py-2 font-bold uppercase tracking-widest text-xs hover:bg-secondary transition-colors"
            >
              Add Payment Method
            </button>
          </div>
        )}
      </div>

      {/* Billing History */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold border-b border-border pb-2">
          Billing History
        </h3>

        <div className="border border-border bg-card">
          <div className="p-6 text-center text-muted-foreground">
            <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No billing history yet</p>
            <p className="text-xs mt-1">
              Your invoices will appear here once you upgrade
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <CancelSubscriptionForm currentPlan={currentPlan} />
    </div>
  );
}

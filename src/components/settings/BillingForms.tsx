"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { Plan } from "@/lib/plans";
import { cn } from "@/lib/utils";

function redirectToCheckout(planId: string) {
  return async () => {
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };
}

function redirectToPortal() {
  return async () => {
    const res = await fetch("/api/billing/portal");
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };
}

export function PlanCard({
  plan,
  currentPlan,
}: {
  plan: Plan;
  currentPlan: string;
  hasPolarCustomer?: boolean;
}) {
  const t = useTranslations("Billing");
  const isCurrent = plan.id === currentPlan;

  return (
    <div
      className={cn(
        "p-6 space-y-4 relative",
        plan.recommended
          ? "border-2 border-primary bg-primary/5"
          : "border-2 border-foreground bg-card",
      )}
    >
      {plan.recommended && (
        <div className="absolute -top-3 left-4 bg-primary text-primary-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
          {t("recommended")}
        </div>
      )}
      <div>
        <h4 className="font-bold text-lg">{t(plan.nameKey)}</h4>
        <p className="text-xs text-muted-foreground mt-1">{t(plan.descriptionKey)}</p>
      </div>
      <div>
        <span className="text-3xl font-mono font-bold">${plan.price}</span>
        <span className="text-muted-foreground">/{t("month")}</span>
      </div>
      <ul className="space-y-2">
        {plan.features.map((featureKey) => (
          <li key={featureKey} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-primary shrink-0" />
            {t(featureKey)}
          </li>
        ))}
      </ul>
      {isCurrent ? (
        <Button variant="outline" size="auto" disabled className="w-full py-3">
          {t("currentPlan")}
        </Button>
      ) : plan.productId ? (
        <form action={redirectToCheckout(plan.id)}>
          <Button
            type="submit"
            variant={plan.recommended ? "submit" : "default"}
            size="submit"
            className="w-full"
          >
            {currentPlan === "free" ? t("upgrade") : t("switch")}
          </Button>
        </form>
      ) : null}
    </div>
  );
}

export function ManageBillingBtn() {
  const t = useTranslations("Billing");
  return (
    <form action={redirectToPortal()}>
      <Button type="submit" variant="outline" size="auto" className="px-4 py-2">
        {t("manageBilling")}
      </Button>
    </form>
  );
}

export function CancelSubscriptionForm({ currentPlan }: { currentPlan: string }) {
  const t = useTranslations("Billing");
  if (currentPlan === "free") return null;

  return (
    <div className="space-y-4 pt-8 border-t-2 border-foreground">
      <h3 className="text-sm font-semibold text-red-500">{t("dangerZone")}</h3>
      <div className="border border-red-500/30 p-4 bg-red-500/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{t("cancelSubscription")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("cancelDesc")}</p>
          </div>
          <form action={redirectToPortal()}>
            <Button type="submit" variant="destructive" size="auto" className="px-4 py-2">
              {t("cancel")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

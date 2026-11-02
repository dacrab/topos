"use client";

import { Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import type { Plan } from "@/lib/plans";
import { cn } from "@/lib/utils";

function redirectToCheckout(planId: string) {
  return async () => {
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const data: { url?: string } = await res.json();
    if (data.url) window.location.href = data.url;
  };
}

function redirectToPortal() {
  return async () => {
    const res = await fetch("/api/billing/portal");
    const data: { url?: string } = await res.json();
    if (data.url) window.location.href = data.url;
  };
}

export function PlanCard({ plan, currentPlan }: { plan: Plan; currentPlan: string }) {
  const t = useTranslations("Billing");
  const locale = useLocale();
  const isCurrent = plan.id === currentPlan;

  return (
    <div
      className={cn(
        "relative flex flex-col border-t-2 p-5",
        plan.recommended ? "border-accent bg-card" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-display text-xl tracking-[-0.02em]">{t(plan.nameKey)}</h4>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {t(plan.descriptionKey)}
          </p>
        </div>
        {plan.recommended && <Badge variant="primary">{t("recommended")}</Badge>}
      </div>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="font-display text-3xl leading-none tracking-[-0.03em] tabular-nums">
          {formatCurrency(plan.price, false, locale)}
        </span>
        <span className="meta-caps text-muted-foreground">/{t("month")}</span>
      </div>

      <ul className="mt-5 flex-1 border-t border-border">
        {plan.features.map((featureKey) => (
          <li
            key={featureKey}
            className="flex items-start gap-2 border-b border-border py-2 text-sm text-muted-foreground"
          >
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            {t(featureKey)}
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <Button variant="outline" size="auto" disabled className="mt-5 w-full py-2.5">
          {t("currentPlan")}
        </Button>
      ) : plan.productId ? (
        <form action={redirectToCheckout(plan.id)} className="mt-5">
          <Button type="submit" variant="default" className="w-full">
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
      <Button type="submit" variant="outline" size="sm">
        {t("manageBilling")}
      </Button>
    </form>
  );
}

export function CancelSubscriptionForm({ currentPlan }: { currentPlan: string }) {
  const t = useTranslations("Billing");
  if (currentPlan === "free") return null;

  return (
    <div className="space-y-4 border-t border-border pt-8">
      <div className="flex items-center gap-3">
        <h3 className="meta-caps text-destructive">{t("dangerZone")}</h3>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="border border-destructive/30 p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="font-medium">{t("cancelSubscription")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("cancelDesc")}</p>
          </div>
          <form action={redirectToPortal()}>
            <Button type="submit" variant="destructive" size="sm">
              {t("cancel")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { ArchTopBar } from "@/components/ui/arch-top";
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
  const isCurrent = plan.id === currentPlan;

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden flex flex-col relative",
        plan.recommended
          ? "border-2 border-primary/30 bg-primary/5"
          : "border border-border/40 bg-card shadow-card",
      )}
    >
      {!plan.recommended && <ArchTopBar />}
      {plan.recommended && <ArchTopBar opacity="solid" />}
      <div className="p-6 space-y-4 flex-1 flex flex-col">
        {plan.recommended && (
          <div className="text-primary text-micro font-semibold tracking-micro">
            {t("recommended")}
          </div>
        )}
        <div>
          <h4 className="font-display font-semibold text-lg">{t(plan.nameKey)}</h4>
          <p className="text-xs text-muted-foreground mt-1">{t(plan.descriptionKey)}</p>
        </div>
        <div>
          <span className="text-3xl font-display font-semibold tracking-tight tabular-nums">
            ${plan.price}
          </span>
          <span className="text-muted-foreground text-sm">/{t("month")}</span>
        </div>
        <ul className="space-y-2 flex-1">
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
          <form action={redirectToCheckout(plan.id)} className="mt-auto">
            <Button type="submit" variant="default" size="lg" className="w-full">
              {currentPlan === "free" ? t("upgrade") : t("switch")}
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

export function ManageBillingBtn() {
  const t = useTranslations("Billing");
  return (
    <form action={redirectToPortal()}>
      <Button type="submit" variant="outline" size="auto" className="px-5 py-2">
        {t("manageBilling")}
      </Button>
    </form>
  );
}

export function CancelSubscriptionForm({ currentPlan }: { currentPlan: string }) {
  const t = useTranslations("Billing");
  if (currentPlan === "free") return null;

  return (
    <div className="space-y-4 pt-8 border-t border-border/40">
      <div className="flex items-center gap-4">
        <h3 className="text-sm font-semibold text-destructive">{t("dangerZone")}</h3>
        <div className="flex-1 h-px bg-border/40" />
      </div>
      <div className="border border-destructive/20 p-4 rounded-2xl bg-destructive/5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">{t("cancelSubscription")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("cancelDesc")}</p>
          </div>
          <form action={redirectToPortal()}>
            <Button type="submit" variant="destructive" size="auto" className="px-5 py-2">
              {t("cancel")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

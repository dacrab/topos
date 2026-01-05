"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { toast } from "sonner";
import { changePlan } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui";

type Plan = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  limits: { listings: number; teamMembers: number };
  recommended?: boolean;
};

export function PlanCard({
  plan,
  currentPlan,
  currentPrice,
}: {
  plan: Plan;
  currentPlan: string;
  currentPrice: number;
}) {
  const t = useTranslations("Billing");
  const [isPending, startTransition] = useTransition();
  const isCurrent = plan.id === currentPlan;

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await changePlan(formData);
      toast[result.success ? "success" : "error"](result.message);
    });
  }

  return (
    <div
      className={`border p-6 space-y-4 relative ${plan.recommended ? "border-primary bg-primary/5" : "border-border bg-card"}`}
    >
      {plan.recommended && (
        <div className="absolute -top-3 left-4 bg-primary text-primary-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
          {t("recommended")}
        </div>
      )}
      <div>
        <h4 className="font-bold text-lg">{plan.name}</h4>
        <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
      </div>
      <div>
        <span className="text-3xl font-mono font-bold">${plan.price}</span>
        <span className="text-muted-foreground">/{t("month")}</span>
      </div>
      <ul className="space-y-2">
        {plan.features.map((f) => (
          <li
            key={f}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Check className="w-4 h-4 text-primary flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      {isCurrent ? (
        <Button variant="outline" size="auto" disabled className="w-full py-3">
          {t("currentPlan")}
        </Button>
      ) : (
        <form action={handleSubmit}>
          <input type="hidden" name="plan" value={plan.id} />
          <Button
            type="submit"
            variant={plan.recommended ? "submit" : "default"}
            size="auto"
            disabled={isPending}
            className="w-full py-3"
          >
            {isPending
              ? t("processing")
              : plan.price > currentPrice
                ? t("upgrade")
                : t("switch")}
          </Button>
        </form>
      )}
    </div>
  );
}

export function CancelSubscriptionForm({
  currentPlan,
}: {
  currentPlan: string;
}) {
  const t = useTranslations("Billing");
  const [isPending, startTransition] = useTransition();

  if (currentPlan === "free") return null;

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await changePlan(formData);
      toast[result.success ? "success" : "error"](result.message);
    });
  }

  return (
    <div className="space-y-4 pt-8 border-t border-border">
      <h3 className="text-sm font-semibold text-red-500">{t("dangerZone")}</h3>
      <div className="border border-red-500/30 p-4 bg-red-500/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{t("cancelSubscription")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("cancelDesc")}
            </p>
          </div>
          <form action={handleSubmit}>
            <input type="hidden" name="plan" value="free" />
            <Button
              type="submit"
              variant="destructive"
              size="auto"
              disabled={isPending}
              className="px-4 py-2"
            >
              {isPending ? t("processing") : t("cancel")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

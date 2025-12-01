"use client";

import { Check } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { changePlan } from "@/app/(dashboard)/settings/actions";

type Plan = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  limits: { listings: number; teamMembers: number };
  recommended?: boolean;
};

type PlanCardProps = {
  plan: Plan;
  currentPlan: string;
  currentPrice: number;
};

export function PlanCard({ plan, currentPlan, currentPrice }: PlanCardProps) {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await changePlan(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  const isCurrent = plan.id === currentPlan;

  return (
    <div
      className={`border p-6 space-y-4 relative ${
        plan.recommended
          ? "border-primary bg-primary/5"
          : "border-border bg-card"
      }`}
    >
      {plan.recommended && (
        <div className="absolute -top-3 left-4 bg-primary text-primary-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
          Recommended
        </div>
      )}

      <div>
        <h4 className="font-bold text-lg">{plan.name}</h4>
        <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
      </div>

      <div>
        <span className="text-3xl font-mono font-bold">${plan.price}</span>
        <span className="text-muted-foreground">/month</span>
      </div>

      <ul className="space-y-2">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Check className="w-4 h-4 text-primary flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <button
          type="button"
          disabled
          className="w-full py-3 border border-border text-muted-foreground font-bold uppercase tracking-widest text-xs cursor-not-allowed"
        >
          Current Plan
        </button>
      ) : (
        <form action={handleSubmit}>
          <input type="hidden" name="plan" value={plan.id} />
          <button
            type="submit"
            disabled={isPending}
            className={`w-full py-3 font-bold uppercase tracking-widest text-xs transition-opacity hover:opacity-90 disabled:opacity-50 ${
              plan.recommended
                ? "bg-primary text-primary-foreground"
                : "bg-foreground text-background"
            }`}
          >
            {isPending
              ? "Processing..."
              : plan.price > currentPrice
                ? "Upgrade"
                : "Switch"}
          </button>
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
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await changePlan(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  if (currentPlan === "free") return null;

  return (
    <div className="space-y-4 pt-8 border-t border-border">
      <h3 className="text-sm font-semibold text-red-500">Danger Zone</h3>

      <div className="border border-red-500/30 p-4 bg-red-500/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Cancel Subscription</p>
            <p className="text-xs text-muted-foreground mt-1">
              Downgrade to free plan and lose access to premium features
            </p>
          </div>
          <form action={handleSubmit}>
            <input type="hidden" name="plan" value="free" />
            <button
              type="submit"
              disabled={isPending}
              className="border border-red-500 text-red-500 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
            >
              {isPending ? "Processing..." : "Cancel"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

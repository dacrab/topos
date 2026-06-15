import { Check } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MARKETING_PLANS } from "@/lib/plans";

export default async function PricingPage() {
  const t = await getTranslations("HomePage");
  const tc = await getTranslations("Common");

  return (
    <div className="py-24 md:py-32">
      <div className="section-container">
        <div className="text-center mb-16">
          <p className="label-caps mb-3">{t("pricingTitle")}</p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{t("pricingSubtitle")}</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {MARKETING_PLANS.map((plan) => (
            <div
              key={plan.nameKey}
              className={`flex flex-col p-8 transition-all ${
                plan.featured
                  ? "bg-brand text-brand-foreground border border-border shadow-elevated scale-[1.02]"
                  : "bg-card border border-border shadow-sm"
              }`}
            >
              <div className="mb-8">
                <p
                  className={`text-sm font-medium mb-4 ${plan.featured ? "text-background/60" : "text-muted-foreground"}`}
                >
                  {t(plan.nameKey)}
                </p>
                <div className="text-4xl font-bold tracking-tight font-mono">
                  {t(plan.priceKey)}
                </div>
                <p
                  className={`text-sm mt-2 ${plan.featured ? "text-background/60" : "text-muted-foreground"}`}
                >
                  {t(plan.descKey)}
                </p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((key) => (
                  <li key={key} className="flex items-center gap-3 text-sm">
                    <Check
                      className={`w-4 h-4 shrink-0 ${plan.featured ? "text-background/50" : "text-muted-foreground"}`}
                    />
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className={`inline-flex items-center justify-center px-8 py-3 text-sm font-medium rounded-md transition-colors ${
                  plan.featured
                    ? "border border-foreground text-foreground bg-transparent hover:bg-foreground hover:text-background"
                    : "bg-brand text-brand-foreground hover:bg-brand/90"
                }`}
              >
                {tc("getStarted")}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
          <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight">
            {t("pricingSubtitle")}
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {MARKETING_PLANS.map((plan) => (
            <div
              key={plan.nameKey}
              className={`flex flex-col p-8 rounded-xl border transition-all ${
                plan.featured
                  ? "bg-primary text-primary-foreground border-primary shadow-elevated scale-[1.02]"
                  : "bg-card border-border/60 shadow-card"
              }`}
            >
              <div className="mb-8">
                <p
                  className={`text-sm font-medium mb-4 ${plan.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                >
                  {plan.featured && (
                    <span className="inline-block bg-primary-foreground text-primary px-2.5 py-0.5 rounded-md text-xs font-semibold mr-2">
                      {t("popular")}
                    </span>
                  )}
                  {t(plan.nameKey)}
                </p>
                <div className="font-display text-4xl font-semibold tracking-tight tabular-nums">
                  {t(plan.priceKey)}
                </div>
                <p
                  className={`text-sm mt-2 ${plan.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                >
                  {t(plan.descKey)}
                </p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((key) => (
                  <li key={key} className="flex items-center gap-3 text-sm">
                    <Check
                      className={`w-4 h-4 shrink-0 ${plan.featured ? "text-primary-foreground/50" : "text-accent"}`}
                    />
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className={`inline-flex items-center justify-center px-8 py-3 text-sm font-medium rounded-xl transition-colors border shadow-card ${
                  plan.featured
                    ? "border-primary-foreground text-primary bg-primary-foreground hover:bg-primary-foreground/90"
                    : "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
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

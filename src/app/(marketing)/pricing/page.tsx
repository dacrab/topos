import { Check } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MARKETING_PLANS } from "@/lib/plans";

export default async function PricingPage() {
  const t = await getTranslations("HomePage");
  const tc = await getTranslations("Common");

  return (
    <div className="py-20 md:py-28 relative">
      <div className="shell">
        <div className="text-center mb-14">
          <div className="chip-eyebrow mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {t("pricingTitle")}
          </div>
          <h1 className="font-display text-heading-1 md:text-hero-2 font-medium tracking-tight leading-display">
            {t("pricingSubtitle")}
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {MARKETING_PLANS.map((plan) => (
            <div
              key={plan.nameKey}
              className={`relative flex flex-col rounded-xl border transition-all duration-300 ${
                plan.featured
                  ? "border-primary/40 bg-primary text-primary-foreground shadow-elevated md:-translate-y-2"
                  : "card-base card-hover hover:border-primary/25"
              }`}
            >
              <div className="p-7 flex-1 flex flex-col">
                <div className="mb-8">
                  <p
                    className={`label-caps mb-4 ${
                      plan.featured ? "text-primary-foreground/60" : ""
                    }`}
                  >
                    {plan.featured && (
                      <span className="inline-block bg-primary-foreground/15 px-2 py-0.5 rounded text-primary-foreground normal-case tracking-normal mr-2">
                        {t("popular")}
                      </span>
                    )}
                    {t(plan.nameKey)}
                  </p>
                  <div className="font-display text-4xl font-medium tracking-tight tabular-nums">
                    {t(plan.priceKey)}
                  </div>
                  <p
                    className={`text-sm mt-3 ${
                      plan.featured ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {t(plan.descKey)}
                  </p>
                </div>

                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((key) => (
                    <li key={key} className="flex items-center gap-3 text-sm">
                      <Check
                        className={`w-4 h-4 shrink-0 ${
                          plan.featured ? "text-primary-foreground/60" : "text-primary"
                        }`}
                      />
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/sign-up"
                  className={`w-full h-10 text-sm font-medium flex items-center justify-center rounded-lg active-scale transition-all border ${
                    plan.featured
                      ? "bg-primary-foreground text-primary border-primary-foreground hover:bg-primary-foreground/90"
                      : "btn-primary border-transparent bg-primary"
                  }`}
                >
                  {tc("getStarted")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

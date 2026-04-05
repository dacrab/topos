import { Check } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MARKETING_PLANS } from "@/lib/plans";

export default async function PricingPage() {
  const t = await getTranslations("HomePage");
  const tc = await getTranslations("Common");

  return (
    <div className="py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
            {t("pricingTitle")}
          </h1>
          <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
            {t("pricingSubtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {MARKETING_PLANS.map((plan) => (
            <div
              key={plan.nameKey}
              className={`p-8 border flex flex-col ${plan.featured ? "bg-foreground text-background border-foreground" : "bg-background border-border"}`}
            >
              <div className="mb-6">
                <h3
                  className={`text-xs font-bold uppercase tracking-widest mb-3 ${plan.featured ? "text-background/70" : "text-muted-foreground"}`}
                >
                  {t(plan.nameKey)}
                </h3>
                <div className="text-5xl font-bold tracking-tighter mb-2">{t(plan.priceKey)}</div>
                <p
                  className={`text-sm ${plan.featured ? "text-background/60" : "text-muted-foreground"}`}
                >
                  {t(plan.descKey)}
                </p>
              </div>
              <div
                className={`flex-1 border-t pt-6 mb-6 ${plan.featured ? "border-background/20" : "border-border"}`}
              >
                <ul className="space-y-3">
                  {plan.features.map((key) => (
                    <li key={key} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 opacity-50 shrink-0" />
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/sign-up"
                className={`w-full h-12 text-xs font-bold uppercase tracking-widest flex items-center justify-center transition-colors ${plan.featured ? "bg-background text-foreground hover:bg-background/90" : "bg-foreground text-background hover:bg-foreground/90"}`}
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

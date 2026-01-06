import { Check } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MarketingContainer, PageHeader } from "@/components/ui";

const PLANS = [
  {
    nameKey: "starter",
    priceKey: "free",
    descKey: "starterDesc",
    features: ["starterF1", "starterF2", "starterF3"],
  },
  {
    nameKey: "growth",
    priceKey: "growthPrice",
    descKey: "growthDesc",
    features: ["growthF1", "growthF2", "growthF3"],
    featured: true,
  },
  {
    nameKey: "enterprise",
    priceKey: "custom",
    descKey: "enterpriseDesc",
    features: ["enterpriseF1", "enterpriseF2", "enterpriseF3"],
  },
];

export default async function PricingPage() {
  const t = await getTranslations("Pages");
  const th = await getTranslations("HomePage");
  const tc = await getTranslations("Common");

  return (
    <MarketingContainer>
      <PageHeader title={t("pricingPageTitle")} subtitle={t("pricingPageSubtitle")} />

      <div className="grid md:grid-cols-3 gap-8">
        {PLANS.map((plan) => {
          const inv = plan.featured;
          return (
            <div
              key={plan.nameKey}
              className={`p-8 border flex flex-col ${inv ? "bg-foreground text-background border-foreground" : "bg-background border-border"}`}
            >
              <div className="mb-6">
                <h3
                  className={`text-xs font-bold uppercase tracking-widest mb-3 ${inv ? "text-background/70" : "text-muted-foreground"}`}
                >
                  {th(plan.nameKey)}
                </h3>
                <div className="text-5xl font-bold tracking-tighter mb-2">{th(plan.priceKey)}</div>
                <p className={`text-sm ${inv ? "text-background/60" : "text-muted-foreground"}`}>
                  {th(plan.descKey)}
                </p>
              </div>

              <div
                className={`flex-1 border-t pt-6 mb-6 ${inv ? "border-background/20" : "border-border"}`}
              >
                <ul className="space-y-3">
                  {plan.features.map((key) => (
                    <li key={key} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 opacity-50 flex-shrink-0" />
                      <span>{th(key)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/sign-up"
                className={`w-full h-12 text-xs font-bold uppercase tracking-widest flex items-center justify-center transition-colors ${
                  inv
                    ? "bg-background text-foreground hover:bg-background/90"
                    : "bg-foreground text-background hover:bg-foreground/90"
                }`}
              >
                {tc("getStarted")}
              </Link>
            </div>
          );
        })}
      </div>
    </MarketingContainer>
  );
}

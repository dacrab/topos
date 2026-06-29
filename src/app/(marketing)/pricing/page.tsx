import { Check, Compass } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MARKETING_PLANS } from "@/lib/plans";

export default async function PricingPage() {
  const t = await getTranslations("HomePage");
  const tc = await getTranslations("Common");

  return (
    <div className="py-24 md:py-32 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/[0.02] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/[0.02] blur-3xl" />
      </div>

      <div className="section-container relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/20 bg-primary/[0.04] rounded-full text-[11px] text-primary font-mono tracking-[0.15em] uppercase mb-4">
            <Compass className="w-3 h-3" />
            {t("pricingTitle")}
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            {t("pricingSubtitle")}
          </h1>
          <div className="divider-meander mt-8 max-w-[200px] mx-auto" />
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {MARKETING_PLANS.map((plan) => (
            <div
              key={plan.nameKey}
              className={`relative flex flex-col rounded-3xl border transition-all duration-300 ${
                plan.featured
                  ? "scale-[1.02] shadow-elevated border-primary/40 bg-foreground text-background z-10"
                  : "shadow-card border-border/40 bg-card card-hover hover:shadow-card-hover"
              }`}
            >
              {/* Top accent bar */}
              {plan.featured ? (
                <div className="h-1.5 bg-gradient-to-r from-accent via-primary to-brand rounded-t-3xl" />
              ) : (
                <div className="h-1.5 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-t-3xl" />
              )}

              <div className="p-8 flex-1 flex flex-col">
                <div className="mb-8">
                  <p
                    className={`text-sm font-medium mb-4 flex items-center gap-2 ${
                      plan.featured ? "text-background/70" : "text-muted-foreground"
                    }`}
                  >
                    {plan.featured && (
                      <span className="inline-block bg-accent text-accent-foreground px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide">
                        {t("popular")}
                      </span>
                    )}
                    {t(plan.nameKey)}
                  </p>
                  <div className="font-display text-4xl font-semibold tracking-tight tabular-nums">
                    {t(plan.priceKey)}
                  </div>
                  <p
                    className={`text-sm mt-2 ${
                      plan.featured ? "text-background/70" : "text-muted-foreground"
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
                          plan.featured ? "text-background/40" : "text-primary"
                        }`}
                      />
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/sign-up"
                  className={`w-full h-12 text-sm font-medium flex items-center justify-center rounded-full transition-all border ${
                    plan.featured
                      ? "bg-background text-foreground border-background hover:bg-background/90 active:scale-[0.97]"
                      : "bg-foreground text-background border-foreground hover:bg-foreground/90 active:scale-[0.97]"
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

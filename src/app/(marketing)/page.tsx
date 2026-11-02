import { ArrowDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { SitePlan } from "@/components/common/SitePlan";
import { formatCurrency } from "@/lib/format";
import { PLANS } from "@/lib/plans";
import { cn } from "@/lib/utils";

const PILLARS = [
  { id: "site", index: "01" },
  { id: "ledger", index: "02" },
  { id: "record", index: "03" },
] as const;

export default async function HomePage() {
  const [t, tb, tc, locale] = await Promise.all([
    getTranslations("HomePage"),
    getTranslations("Billing"),
    getTranslations("Common"),
    getLocale(),
  ]);

  const titleLines = t("title").split("\n");

  return (
    <>
      {/* ── HERO ── */}
      <section className="border-b-2 border-foreground/85">
        <div className="shell grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:gap-0">
          <div className="flex flex-col justify-between lg:col-span-7 lg:pr-14">
            <div>
              <p className="chip-eyebrow mb-8">{t("positioning")}</p>
              <h1 className="font-display text-[clamp(2.75rem,6vw,5.6rem)] font-normal leading-hero tracking-[-0.035em] text-foreground">
                {titleLines.map((line, i) => (
                  <span key={line} className="block">
                    {i === titleLines.length - 1 ? (
                      <em className="italic text-accent">{line}</em>
                    ) : (
                      line
                    )}
                  </span>
                ))}
              </h1>
              <p className="mt-8 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t("subtitle")}
              </p>
            </div>

            <div className="mt-10">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/sign-up"
                  className="btn-primary btn-md justify-between sm:justify-center"
                >
                  {tc("getStarted")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#plans"
                  className="btn-outline btn-md justify-between sm:justify-center"
                >
                  {t("seePlans")}
                  <ArrowDown className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-5 border-t border-border pt-4 font-mono text-micro uppercase leading-relaxed tracking-caps text-muted-foreground">
                {t("freeFacts")}
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 lg:border-l lg:border-border lg:pl-10">
            <SitePlan
              caption={t("plateCaption")}
              className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none"
            />
          </div>
        </div>
      </section>

      {/* ── THE PLATFORM ── */}
      <section id="platform" className="scroll-mt-20 border-b border-border">
        <div className="shell py-16 md:py-24">
          <div className="grid gap-6 border-b-2 border-foreground/85 pb-10 lg:grid-cols-12 lg:gap-0">
            <p className="chip-eyebrow lg:col-span-3">01 / {t("platformTagline")}</p>
            <h2 className="font-display text-2xl leading-snug tracking-[-0.02em] sm:text-3xl lg:col-span-9 lg:max-w-3xl">
              {t("platformTitle")}
            </h2>
          </div>

          <div className="grid lg:grid-cols-3">
            {PILLARS.map((pillar) => (
              <article
                key={pillar.id}
                className="flex flex-col gap-7 border-b border-border py-8 last:border-b-0 lg:border-b-0 lg:border-l lg:px-8 lg:py-10 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
              >
                <div className="flex items-baseline gap-3">
                  <span className="index-caps">{pillar.index}</span>
                  <h3 className="card-title">{t(`${pillar.id}Title`)}</h3>
                </div>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  {t(`${pillar.id}Desc`)}
                </p>
                <p className="border-t border-border pt-3 micro-caps text-muted-foreground/80">
                  {t(`${pillar.id}Index`)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS ── */}
      <section id="plans" className="scroll-mt-20 border-b-2 border-foreground/85">
        <div className="shell py-16 md:py-24">
          <div className="grid gap-6 border-b-2 border-foreground/85 pb-10 lg:grid-cols-12 lg:gap-0">
            <p className="chip-eyebrow lg:col-span-3">02 / {t("plansTagline")}</p>
            <div className="lg:col-span-9">
              <h2 className="font-display text-3xl leading-tight tracking-[-0.025em] sm:text-4xl">
                {t("plansTitle")}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {t("plansDesc")}
              </p>
            </div>
          </div>

          <div className="divide-y divide-border">
            {PLANS.map((plan, i) => (
              <div
                key={plan.id}
                className="grid gap-6 py-7 md:grid-cols-12 md:items-start md:gap-6"
              >
                <div className="md:col-span-3">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="index-caps">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="card-title">{tb(plan.nameKey)}</h3>
                    {plan.recommended && (
                      <span className="border border-accent px-1.5 py-0.5 micro-caps text-accent">
                        {tb("recommended")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {tb(plan.descriptionKey)}
                  </p>
                </div>

                <div className="flex items-baseline gap-1.5 md:col-span-2">
                  <span className="font-display text-3xl leading-none tracking-[-0.03em] tabular-nums">
                    {formatCurrency(plan.price, false, locale)}
                  </span>
                  <span className="meta-caps text-muted-foreground">
                    /{plan.price === 0 ? t("forever") : tb("month")}
                  </span>
                </div>

                <ul className="grid gap-x-6 sm:grid-cols-2 md:col-span-5">
                  {plan.features.map((key) => (
                    <li
                      key={key}
                      className="flex items-start gap-2 py-1 text-xs leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-[0.4rem] h-1 w-1 shrink-0 bg-accent" />
                      {tb(key)}
                    </li>
                  ))}
                </ul>

                <div className="md:col-span-2 md:text-right">
                  <Link
                    href="/sign-up"
                    className={cn(
                      "btn-sm w-full justify-between md:w-auto md:justify-center",
                      plan.recommended ? "btn-primary" : "btn-outline",
                    )}
                  >
                    {tc("getStarted")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSE ── */}
      <section className="bg-foreground text-background">
        <div className="shell flex flex-col gap-6 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-3xl leading-none tracking-[-0.03em] sm:text-4xl">
              {t("ctaHeading")}
            </h2>
          </div>
          <Link
            href="/sign-up"
            className="inline-flex h-11 shrink-0 items-center justify-between gap-4 bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground active-scale"
          >
            {tc("getStarted")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

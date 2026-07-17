import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Building2, Check, Layers, Shield } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Fragment } from "react";
import { Logo } from "@/components/common/Logo";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { ThemeControls } from "@/components/ui/mode-toggle";
import { APP_CONFIG } from "@/lib/config";
import { MARKETING_PLANS } from "@/lib/plans";

export default async function HomePage() {
  const [t, tc, { userId }] = await Promise.all([
    getTranslations("HomePage"),
    getTranslations("Common"),
    auth(),
  ]);

  const isLoggedIn = !!userId;

  const stats = [
    { value: t("stat1Value"), label: t("stat1Label") },
    { value: t("stat2Value"), label: t("stat2Label") },
    { value: t("stat3Value"), label: t("stat3Label") },
  ];

  const features = [
    {
      icon: Building2,
      title: t("multiTenantTitle"),
      desc: t("multiTenantDescription"),
    },
    {
      icon: Layers,
      title: t("brandingTitle"),
      desc: t("brandingDescription"),
    },
    {
      icon: Shield,
      title: t("securityTitle"),
      desc: t("securityDescription"),
    },
  ] as const;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <div className="max-w-6xl mx-auto px-6 md:px-12 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo showText={false} />
            <span className="font-display font-medium tracking-tight text-lg hidden sm:block group-hover:text-primary transition-colors">
              {APP_CONFIG.name}
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            <LocaleSwitcher className="h-8 px-3 flex items-center rounded-full hover:bg-foreground/5 transition-colors text-sm" />
            <ThemeControls className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-foreground/5 transition-colors" />
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center text-primary-foreground px-5 py-1.5 text-sm font-medium rounded-full active-scale card-hover shadow-card hover:shadow-card-hover transition-all bg-primary"
              >
                {tc("dashboard")}
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="hidden sm:inline-flex items-center px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full"
                >
                  {tc("login")}
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center text-primary-foreground px-5 py-1.5 text-sm font-medium rounded-full active-scale card-hover shadow-card hover:shadow-card-hover transition-all bg-primary"
                >
                  {tc("getStarted")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* HERO — Asymmetric 8/4 site-plan title */}
        <section className="relative border-b border-border texture-linen">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="grid md:grid-cols-12 gap-8 md:gap-12 py-24 md:py-36">
              <div className="md:col-span-8 animate-fade-up">
                <div className="flex items-center gap-3 mb-10">
                  <span className="section-num text-sun">01</span>
                  <span className="w-12 h-px bg-border" />
                  <span className="mono-micro">{APP_CONFIG.name}</span>
                </div>

                <h1 className="font-display text-hero-3 md:text-hero-1 font-medium tracking-tight leading-hero mb-10">
                  {t("title")
                    .split("\n")
                    .map((line, i) => (
                      <span key={line} className="block">
                        {i === 1 ? (
                          <em className="font-cormorant text-aegean italic font-medium">{line}</em>
                        ) : (
                          line
                        )}
                      </span>
                    ))}
                </h1>

                <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-12 max-w-xl">
                  {t("subtitle")}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  {isLoggedIn ? (
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center gap-2 text-primary-foreground h-12 px-7 rounded-full active-scale card-hover shadow-card hover:shadow-card-hover text-sm font-medium transition-all bg-primary"
                    >
                      {tc("dashboard")}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/sign-up"
                        className="inline-flex items-center justify-center gap-2 text-primary-foreground h-12 px-7 rounded-full active-scale card-hover shadow-card hover:shadow-card-hover text-sm font-medium transition-all bg-primary"
                      >
                        {tc("getStarted")}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/sign-in"
                        className="inline-flex items-center justify-center gap-2 border h-12 px-7 rounded-full text-sm font-medium text-foreground hover:bg-foreground/[0.03] transition-all"
                      >
                        {tc("login")}
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="md:col-span-4 animate-fade-up [animation-delay:0.15s]">
                <div className="md:pt-4">
                  <p className="mono-micro mb-6 text-aegean">{t("testimonialLabel")}</p>
                  <p className="font-display text-xl md:text-2xl font-medium tracking-tight leading-display-tight text-foreground">
                    {t("featuresSubtitle")}
                  </p>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    {t("featuresTagline")}
                  </p>
                  <div className="mt-8 pt-6 border-t border-border">
                    <p className="mono-micro">
                      {APP_CONFIG.name} · {t("pricingTitle")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* THE SITE PLAN — Surveyor's sheet */}
        <section id="features" className="border-b border-border">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-32">
            <div className="flex items-baseline gap-4 mb-16">
              <span className="section-num text-sun">02</span>
              <div className="aeon-divider w-20">
                <span className="aeon-divider-disc" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-3xl md:text-hero-2 font-medium tracking-tight leading-display">
                  {t("featuresSubtitle")}
                </h2>
              </div>
            </div>

            <div className="relative border border-border bg-card shadow-card rounded-md overflow-hidden texture-linen">
              <div
                aria-hidden
                className="absolute inset-0 grid grid-cols-2 md:grid-cols-12 gap-px pointer-events-none"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static decorative grid cells
                  <div key={i} className="border-r border-border/20 last:border-r-0" />
                ))}
              </div>

              <div className="relative p-8 md:p-12">
                {features.map((f, i) => (
                  <Fragment key={f.title}>
                    {i > 0 && <div className="h-px bg-border/40 my-10 md:my-12" />}
                    <div className="relative grid md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-1">
                        <span className="section-num text-sun">{i + 1}</span>
                      </div>
                      <div className="md:col-span-2 flex items-center justify-center md:justify-start">
                        <div className="w-12 h-12 rounded-full bg-primary/8 flex items-center justify-center shrink-0">
                          <f.icon className="w-5 h-5 text-primary" />
                        </div>
                      </div>
                      <div className="md:col-span-9 space-y-2">
                        <h3 className="font-display text-xl md:text-2xl font-medium tracking-tight">
                          {f.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm max-w-md">
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PULL-QUOTE + LEDGER — Editorial proof */}
        <section className="border-b border-border">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-24 md:py-36">
            <div className="flex items-baseline gap-4 mb-12">
              <span className="section-num text-sun">03</span>
              <div className="aeon-divider w-20">
                <span className="aeon-divider-disc" />
              </div>
              <span className="mono-micro">{t("testimonialLabel")}</span>
            </div>

            <div className="md:ml-16 max-w-3xl">
              <blockquote>
                <p className="font-display text-2xl md:text-hero-3 font-medium tracking-tight leading-display-tight text-foreground">
                  &ldquo;{t("testimonialQuote")}&rdquo;
                </p>
                <footer className="mt-8 mono-micro text-aegean">
                  {t("testimonialAuthor")} · {t("testimonialRole")}
                </footer>
              </blockquote>
            </div>

            <dl className="mt-16 grid grid-cols-3 border-t border-b border-border">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col gap-1 py-6 px-3 md:px-6 border-r border-border last:border-r-0"
                >
                  <dd className="font-display text-3xl md:text-5xl font-medium tabular-nums tracking-tight text-foreground">
                    {s.value}
                  </dd>
                  <dt className="mono-micro">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* PRICING — Quiet table-style cards */}
        <section id="pricing" className="border-b border-border">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-32">
            <div className="flex items-baseline gap-4 mb-16">
              <span className="section-num text-sun">04</span>
              <div className="aeon-divider w-20">
                <span className="aeon-divider-disc" />
              </div>
              <div className="flex-1">
                <p className="mono-micro mb-3">{t("pricingTitle")}</p>
                <h2 className="font-display text-3xl md:text-hero-2 font-medium tracking-tight leading-display">
                  {t("pricingSubtitle")}
                </h2>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {MARKETING_PLANS.map((plan) => (
                <div
                  key={plan.nameKey}
                  className={`relative flex flex-col rounded-md border transition-all duration-300 ${
                    plan.featured
                      ? "text-primary-foreground border-primary shadow-elevated bg-primary"
                      : "bg-card border-border hover:border-primary/30"
                  }`}
                >
                  <div className="p-7 flex flex-col flex-1">
                    <div className="mb-8">
                      <p
                        className={`mono-micro mb-4 ${
                          plan.featured ? "text-primary-foreground/60" : "text-muted-foreground"
                        }`}
                      >
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
                        <li key={key} className="flex items-start gap-3 text-sm">
                          <Check
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              plan.featured ? "text-primary-foreground/50" : "text-primary"
                            }`}
                          />
                          <span>{t(key)}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/sign-up"
                      className={`w-full h-11 text-sm font-medium flex items-center justify-center rounded-full active-scale card-hover border ${
                        plan.featured
                          ? "bg-primary-foreground text-primary border-primary-foreground hover:bg-primary-foreground/90"
                          : "text-primary-foreground border-primary hover:bg-primary/90 bg-primary"
                      }`}
                    >
                      {tc("getStarted")}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
          <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <Logo showText={false} />
              <span className="font-display font-medium tracking-tight">{APP_CONFIG.name}</span>
            </Link>

            <p className="mono-micro">
              {t("ctaDescription")}{" "}
              <Link
                href="/sign-up"
                className="ml-2 inline-flex items-center gap-1 underline underline-offset-4 hover:text-primary transition-colors"
              >
                {tc("getStarted")}
                <ArrowRight className="w-3 h-3" />
              </Link>
            </p>

            <nav className="flex gap-6 items-baseline">
              <Link href="/pricing" className="mono-micro hover:text-aegean transition-colors">
                {tc("pricing")}
              </Link>
              <Link href="/privacy" className="mono-micro hover:text-aegean transition-colors">
                {tc("privacy")}
              </Link>
              <Link href="/terms" className="mono-micro hover:text-aegean transition-colors">
                {tc("terms")}
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

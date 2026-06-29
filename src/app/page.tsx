import { ArrowRight, ArrowUpRight, Building2, Check, Layers, Shield } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/common/Logo";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { ThemeControls } from "@/components/ui/mode-toggle";
import { getSession } from "@/lib/auth";
import { APP_CONFIG } from "@/lib/config";
import { MARKETING_PLANS } from "@/lib/plans";

export default async function HomePage() {
  const [t, tc, session] = await Promise.all([
    getTranslations("HomePage"),
    getTranslations("Common"),
    getSession(),
  ]);

  const isLoggedIn = !!session;

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

  const FeatureIcon = features[0].icon;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* ── Header ── */}
      <header className="site-header">
        <div className="flex h-16 items-center justify-between max-w-6xl mx-auto px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo showText={false} />
            <span className="font-display font-medium tracking-tight text-xl hidden sm:block group-hover:text-primary transition-colors">
              {APP_CONFIG.name}
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <LocaleSwitcher className="h-8 px-3 flex items-center rounded-md hover:bg-foreground/5 transition-colors text-sm" />
            <ThemeControls className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-foreground/5 transition-colors" />
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center bg-primary text-primary-foreground px-5 py-1.5 text-sm font-medium rounded-md hover:bg-primary/90 transition-all"
              >
                {tc("dashboard")}
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="hidden sm:inline-flex items-center px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md"
                >
                  {tc("login")}
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center bg-primary text-primary-foreground px-5 py-1.5 text-sm font-medium rounded-md hover:bg-primary/90 transition-all"
                >
                  {tc("getStarted")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* ════════════════════════════════════════════════════════
           HERO — Asymmetric editorial layout
           ════════════════════════════════════════════════════════ */}
        <section className="relative border-b border-border">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="grid md:grid-cols-12 gap-8 md:gap-12 py-20 md:py-32">
              {/* Left — headline + CTAs (7 cols) */}
              <div className="md:col-span-7 flex flex-col justify-center animate-fade-up">
                <div className="flex items-center gap-3 mb-8">
                  <span className="section-num">001</span>
                  <span className="w-12 h-px bg-border" />
                  <span className="text-xs font-mono text-muted-foreground tracking-wide">
                    {APP_CONFIG.name}
                  </span>
                </div>

                <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight leading-[0.98] mb-8">
                  {t("title")
                    .split("\n")
                    .map((line, i) => (
                      <span key={line} className="block">
                        {i === 1 ? (
                          <em className="text-primary not-italic font-normal">{line}</em>
                        ) : (
                          line
                        )}
                      </span>
                    ))}
                </h1>

                <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg">
                  {t("subtitle")}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  {isLoggedIn ? (
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground h-12 px-7 rounded-md text-sm font-medium hover:bg-primary/90 transition-all"
                    >
                      {tc("dashboard")}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/sign-up"
                        className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground h-12 px-7 rounded-md text-sm font-medium hover:bg-primary/90 transition-all"
                      >
                        {tc("getStarted")}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/sign-in"
                        className="inline-flex items-center justify-center gap-2 border border-border h-12 px-7 rounded-md text-sm font-medium text-foreground hover:bg-foreground/[0.03] transition-all"
                      >
                        {tc("login")}
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Right — architectural spec panel (5 cols) */}
              <div className="md:col-span-5 flex items-center animate-fade-up [animation-delay:0.15s]">
                <div className="w-full border border-border bg-card/50 rounded-md p-8">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                    <span className="text-[10px] font-mono tracking-[0.15em] text-muted-foreground">
                      SPECIFICATION
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">v2.0</span>
                  </div>
                  <dl className="space-y-4">
                    <div className="flex justify-between items-baseline">
                      <dt className="text-xs font-mono text-muted-foreground">Platform</dt>
                      <dd className="text-sm font-medium">White-label SaaS</dd>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <dt className="text-xs font-mono text-muted-foreground">Market</dt>
                      <dd className="text-sm font-medium">Real Estate</dd>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <dt className="text-xs font-mono text-muted-foreground">Tenancy</dt>
                      <dd className="text-sm font-medium">Multi-agency</dd>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <dt className="text-xs font-mono text-muted-foreground">Deployment</dt>
                      <dd className="text-sm font-medium">Custom domain</dd>
                    </div>
                  </dl>
                  <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t("featuresTagline")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
           FEATURES — Editorial numbered layout with varied weights
           ════════════════════════════════════════════════════════ */}
        <section id="features" className="border-b border-border">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-32">
            {/* Section header */}
            <div className="flex items-baseline gap-4 mb-16">
              <span className="section-num">02</span>
              <div className="w-12 h-px bg-border" />
              <div className="flex-1">
                <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight leading-[1.05]">
                  {t("featuresSubtitle")}
                </h2>
              </div>
            </div>

            {/* Feature 1 — full width, prominent */}
            <div className="border-t border-border pt-10 mb-10">
              <div className="grid md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-2">
                  <div className="w-14 h-14 rounded-md bg-primary/8 flex items-center justify-center">
                    <FeatureIcon className="w-7 h-7 text-primary" />
                  </div>
                </div>
                <div className="md:col-span-7">
                  <h3 className="font-display text-2xl md:text-3xl font-medium tracking-tight mb-3">
                    {features[0].title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xl">
                    {features[0].desc}
                  </p>
                </div>
                <div className="md:col-span-3 md:text-right">
                  <span className="text-xs font-mono text-muted-foreground">→ Core platform</span>
                </div>
              </div>
            </div>

            {/* Features 2 & 3 — side by side */}
            <div className="grid md:grid-cols-2 gap-px bg-border">
              {features.slice(1).map((f) => (
                <div key={f.title} className="bg-background pt-10">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-md bg-primary/8 flex items-center justify-center shrink-0">
                      <f.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl md:text-2xl font-medium tracking-tight mb-2">
                        {f.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-sm">{f.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
           STATS / TESTIMONIAL — Editorial pull-quote + data
           ════════════════════════════════════════════════════════ */}
        <section className="border-b border-border bg-muted/40">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-28">
            <div className="flex items-baseline gap-4 mb-12">
              <span className="section-num">03</span>
              <div className="w-12 h-px bg-border" />
              <span className="text-xs font-mono text-muted-foreground tracking-wide">
                {t("testimonialLabel") || "TESTIMONIAL"}
              </span>
            </div>

            <div className="grid md:grid-cols-12 gap-8 md:gap-12">
              {/* Pull quote */}
              <div className="md:col-span-7">
                <blockquote>
                  <p className="font-display text-2xl md:text-4xl leading-[1.2] tracking-tight text-foreground">
                    &ldquo;{t("testimonialQuote")}&rdquo;
                  </p>
                  <footer className="mt-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                      {t("testimonialAuthor").charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{t("testimonialAuthor")}</div>
                      <div className="text-xs text-muted-foreground">{t("testimonialRole")}</div>
                    </div>
                  </footer>
                </blockquote>
              </div>

              {/* Stats — stacked rows */}
              <div className="md:col-span-5 space-y-px">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-baseline justify-between py-5 border-t border-border last:border-b"
                  >
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                    <span className="font-display text-3xl md:text-4xl font-medium tracking-tight tabular-nums">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
           PRICING — Clean table-style cards
           ════════════════════════════════════════════════════════ */}
        <section id="pricing" className="border-b border-border">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-32">
            <div className="flex items-baseline gap-4 mb-16">
              <span className="section-num">04</span>
              <div className="w-12 h-px bg-border" />
              <div className="flex-1">
                <p className="text-xs font-mono text-muted-foreground tracking-wide mb-3">
                  {t("pricingTitle")}
                </p>
                <h2 className="font-display text-3xl md:text-5xl font-medium tracking-tight leading-[1.05]">
                  {t("pricingSubtitle")}
                </h2>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl">
              {MARKETING_PLANS.map((plan) => (
                <div
                  key={plan.nameKey}
                  className={`relative flex flex-col rounded-md border transition-all duration-300 ${
                    plan.featured
                      ? "bg-primary text-primary-foreground border-primary shadow-elevated md:-translate-y-3"
                      : "bg-card border-border hover:border-primary/30"
                  }`}
                >
                  <div className="p-7 flex flex-col flex-1">
                    <div className="mb-8">
                      <p
                        className={`text-xs font-mono tracking-wide mb-4 ${
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
                      className={`w-full h-11 text-sm font-medium flex items-center justify-center rounded-md transition-all border ${
                        plan.featured
                          ? "bg-primary-foreground text-primary border-primary-foreground hover:bg-primary-foreground/90"
                          : "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                      }`}
                    >
                      {tc("getStarted")}
                    </Link>
                  </div>

                  {plan.featured && (
                    <div className="absolute -top-3 left-7">
                      <span className="inline-flex items-center bg-accent text-accent-foreground px-3 py-1 rounded text-[10px] font-mono font-semibold tracking-wide">
                        {t("popular")}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
           CTA — Full-bleed, editorial
           ════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden py-24 md:py-40 bg-primary">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-xs font-mono text-primary-foreground/50">05</span>
                <span className="w-12 h-px bg-primary-foreground/20" />
                <span className="text-xs font-mono text-primary-foreground/50 tracking-wide">
                  {t("testimonialLabel") || "GET STARTED"}
                </span>
              </div>

              <h2 className="font-display text-4xl md:text-6xl font-medium tracking-tight leading-[1.02] mb-6 text-primary-foreground">
                {t("ctaTitle")}
              </h2>
              <p className="text-base md:text-lg text-primary-foreground/70 leading-relaxed mb-10 max-w-lg">
                {t("ctaDescription")}
              </p>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 bg-primary-foreground text-primary h-12 px-8 rounded-md text-sm font-medium hover:bg-primary-foreground/90 transition-all"
              >
                {tc("getStarted")}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-16">
          <div className="grid md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <Logo serif />
              </Link>
              <p className="mt-4 text-sm text-muted-foreground max-w-xs">
                {t("featuresTagline")} — {APP_CONFIG.tagline}
              </p>
            </div>
            <div className="md:col-span-4">
              <nav className="flex flex-col gap-3">
                <Link
                  href="/pricing"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tc("pricing")}
                </Link>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tc("privacy")}
                </Link>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tc("terms")}
                </Link>
              </nav>
            </div>
            <div className="md:col-span-3 md:text-right">
              <p className="text-xs font-mono text-muted-foreground">
                &copy; {new Date().getFullYear()} {APP_CONFIG.name}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

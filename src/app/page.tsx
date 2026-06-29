import { ArrowRight, Building2, Check, Compass, Palette, Shield, Sun } from "lucide-react";
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
      icon: Palette,
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
      {/* ── Sticky Header ── */}
      <header className="site-header">
        <div className="flex h-16 items-center justify-between max-w-6xl mx-auto px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo showText={false} />
            <span className="font-display font-semibold tracking-tight text-lg hidden sm:block group-hover:text-primary transition-colors">
              {APP_CONFIG.name}
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <LocaleSwitcher className="h-8 px-3 flex items-center rounded-full hover:bg-accent/10 transition-colors text-sm" />
            <ThemeControls className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-accent/10 transition-colors" />
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center bg-primary text-primary-foreground px-5 py-1.5 text-sm font-medium rounded-full hover:bg-primary/90 transition-all shadow-card hover:shadow-card-hover active:scale-[0.97]"
              >
                {tc("dashboard")}
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="hidden sm:inline-flex items-center px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-accent/10"
                >
                  {tc("login")}
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center bg-primary text-primary-foreground px-5 py-1.5 text-sm font-medium rounded-full hover:bg-primary/90 transition-all shadow-card hover:shadow-card-hover active:scale-[0.97]"
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
           HERO — Full Aegean sunrise
           ════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden border-b border-border/40">
          {/* Background gradient — warm sand to deep Aegean */}
          <div className="absolute inset-0 bg-gradient-to-b from-warning/5 via-primary/[0.03] to-accent/[0.04]" />
          <div className="absolute inset-0 texture-plaster opacity-[0.03]" />

          {/* Decorative arch SVG — large background element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] text-primary/[0.03] dark:text-primary/[0.05] pointer-events-none select-none">
            <svg viewBox="0 0 800 500" fill="none" className="w-full h-full">
              <title>Arch</title>
              <path
                d="M100 500V250C100 112 256.8 0 400 0C543.2 0 700 112 700 250V500"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M200 500V250C200 167 289.6 100 400 100C510.4 100 600 167 600 250V500"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.4"
              />
              <circle cx="400" cy="180" r="40" stroke="currentColor" strokeWidth="1.5" />
              <path d="M400 120V140" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M400 220V240" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M452 180H472" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M328 180H348" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="max-w-6xl mx-auto px-6 md:px-12 py-28 md:py-44 relative">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              {/* Greek epithet */}
              <div className="mb-6 animate-fade-up">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 border border-primary/20 bg-primary/[0.04] rounded-full text-[11px] text-primary font-mono tracking-[0.15em] uppercase">
                  <Sun className="w-3 h-3" />
                  τόπος · a sense of place
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight leading-[1.02] mb-6 animate-fade-up [animation-delay:0.1s]">
                {t("title")
                  .split("\n")
                  .map((line, i) => (
                    <span
                      key={line}
                      className={i === 1 ? "block mt-1 text-accent italic" : "block"}
                    >
                      {line}
                    </span>
                  ))}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg animate-fade-up [animation-delay:0.2s]">
                {t("subtitle")}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 animate-fade-up [animation-delay:0.3s]">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 bg-foreground text-background h-12 px-8 rounded-full text-sm font-medium hover:bg-foreground/90 transition-all shadow-card hover:shadow-card-hover active:scale-[0.97]"
                  >
                    {tc("dashboard")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/sign-up"
                      className="inline-flex items-center justify-center gap-2 bg-foreground text-background h-12 px-8 rounded-full text-sm font-medium hover:bg-foreground/90 transition-all shadow-card hover:shadow-card-hover active:scale-[0.97]"
                    >
                      {tc("getStarted")}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/sign-in"
                      className="inline-flex items-center justify-center border border-border h-12 px-8 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all active:scale-[0.97]"
                    >
                      {tc("login")}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden opacity-[0.08]">
            <svg
              viewBox="0 0 1440 32"
              fill="none"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <title>Wave</title>
              <path
                d="M0 16C240 32 480 0 720 16C960 32 1200 0 1440 16V32H0V16Z"
                fill="var(--primary)"
              />
            </svg>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
           FEATURES — Three pillars
           ════════════════════════════════════════════════════════ */}
        <section id="features" className="border-b border-border/40 relative">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-28 md:py-36">
            <div className="text-center mb-16">
              <p className="label-caps mb-4 text-primary/70">
                {t("featuresTagline") || "Why Topos"}
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight max-w-2xl mx-auto leading-[1.1]">
                {t("featuresSubtitle")}
              </h2>
              <div className="divider-meander mt-8 max-w-[200px] mx-auto" />
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group relative bg-card border border-border/50 rounded-3xl p-8 card-hover shadow-card hover:shadow-card-hover hover:border-primary/20"
                >
                  {/* Decorative arch dot on top */}
                  <div className="absolute -top-px left-8 right-8 h-2 flex justify-center gap-6 overflow-hidden opacity-40">
                    <span className="w-1 h-1 rounded-full bg-primary/30" />
                    <span className="w-1 h-1 rounded-full bg-accent/30" />
                    <span className="w-1 h-1 rounded-full bg-brand/30" />
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold tracking-tight mb-3">
                    {f.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
           STATS / TESTIMONIAL — With Mediterranean voice
           ════════════════════════════════════════════════════════ */}
        <section className="border-b border-border/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-accent/[0.02]" />
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-24 md:py-32 relative">
            <div className="grid md:grid-cols-5 gap-12 md:gap-16 items-center">
              {/* Testimonial */}
              <div className="md:col-span-2">
                <div className="inline-flex items-center gap-2 mb-6">
                  <span className="w-8 h-px bg-accent/40" />
                  <span className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground uppercase">
                    {t("testimonialLabel") || "Testimonial"}
                  </span>
                </div>
                <blockquote className="space-y-6">
                  <p className="font-display text-2xl md:text-3xl leading-snug tracking-tight text-foreground">
                    &ldquo;{t("testimonialQuote")}&rdquo;
                  </p>
                  <div className="border-l-2 border-accent/50 pl-5">
                    <div className="font-semibold text-foreground">{t("testimonialAuthor")}</div>
                    <div className="text-sm text-muted-foreground">{t("testimonialRole")}</div>
                  </div>
                </blockquote>
              </div>

              {/* Stats */}
              <div className="md:col-span-3 space-y-4">
                {stats.map((s, i) => (
                  <div
                    key={s.label}
                    className="group bg-card rounded-2xl p-7 border border-border/40 flex items-center justify-between card-hover shadow-card hover:shadow-card-hover"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="font-display text-3xl md:text-4xl font-semibold tracking-tight tabular-nums text-foreground">
                      {s.value}
                    </div>
                    <div className="text-sm text-muted-foreground text-right max-w-[140px]">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
           PRICING
           ════════════════════════════════════════════════════════ */}
        <section id="pricing" className="border-b border-border/40 relative">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-28 md:py-36">
            <div className="text-center mb-16">
              <p className="label-caps mb-4 text-primary/70">{t("pricingTitle")}</p>
              <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight max-w-2xl mx-auto leading-[1.1]">
                {t("pricingSubtitle")}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {MARKETING_PLANS.map((plan) => (
                <div
                  key={plan.nameKey}
                  className={`relative flex flex-col rounded-3xl border transition-all duration-300 ${
                    plan.featured
                      ? "bg-foreground text-background border-foreground shadow-elevated scale-[1.03] md:scale-[1.05] z-10"
                      : "bg-card border-border/40 card-hover shadow-card hover:shadow-card-hover"
                  }`}
                >
                  {/* Decorative top border */}
                  {plan.featured ? (
                    <div className="h-1.5 bg-gradient-to-r from-accent via-primary to-brand rounded-t-3xl" />
                  ) : (
                    <div className="h-1.5 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-t-3xl" />
                  )}

                  <div className="p-8 flex flex-col flex-1">
                    <div className="mb-8">
                      <p
                        className={`text-sm font-medium mb-3 flex items-center gap-2 ${
                          plan.featured ? "text-background/60" : "text-muted-foreground"
                        }`}
                      >
                        {plan.featured && (
                          <span className="inline-flex items-center gap-1 bg-accent text-accent-foreground px-3 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase">
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
                          plan.featured ? "text-background/60" : "text-muted-foreground"
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
        </section>

        {/* ════════════════════════════════════════════════════════
           CTA — Sunset call to action
           ════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden py-32 md:py-44">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-primary/20 to-foreground" />
          <div className="absolute inset-0 texture-plaster opacity-[0.04]" />

          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-warning/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-brand/10 blur-3xl" />

          <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
            {/* Compass icon */}
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 rounded-full bg-background/10 flex items-center justify-center backdrop-blur-sm">
                <Compass className="w-7 h-7 text-background/80" />
              </div>
            </div>

            <h2 className="font-display text-3xl md:text-6xl font-semibold tracking-tight mb-4 text-background">
              {t("ctaTitle")}
            </h2>
            <p className="text-base md:text-lg text-background/70 max-w-xl mx-auto leading-relaxed mb-10">
              {t("ctaDescription")}
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 bg-background text-foreground h-13 px-10 rounded-full text-sm font-medium hover:bg-background/90 transition-all shadow-elevated active:scale-[0.97]"
            >
              {tc("getStarted")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Bottom wave */}
          <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden opacity-[0.06]">
            <svg
              viewBox="0 0 1440 48"
              fill="none"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <title>Wave</title>
              <path
                d="M0 24C240 48 480 0 720 24C960 48 1200 0 1440 24V48H0V24Z"
                fill="var(--background)"
              />
            </svg>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 bg-gradient-to-b from-transparent to-muted/20">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-3">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <Logo serif />
              </Link>
              <p className="text-[10px] text-muted-foreground/40 font-mono tracking-[0.2em] uppercase">
                τόπος · a sense of place
              </p>
            </div>
            <nav className="flex gap-8">
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
          <div className="divider-meander mt-10 mb-6 max-w-xs mx-auto" />
          <p className="text-center text-sm text-muted-foreground/40">
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}
          </p>
        </div>
      </footer>
    </div>
  );
}

import { ArrowRight, Building2, Check, Palette, Shield } from "lucide-react";
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
      accent: "primary",
    },
    {
      icon: Palette,
      title: t("brandingTitle"),
      desc: t("brandingDescription"),
      accent: "accent",
    },
    {
      icon: Shield,
      title: t("securityTitle"),
      desc: t("securityDescription"),
      accent: "primary",
    },
  ] as const;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="site-header">
        <div className="flex h-14 items-center justify-between max-w-6xl mx-auto px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo showText={false} />
            <span className="font-display font-semibold tracking-tight text-lg hidden sm:block">
              {APP_CONFIG.name}
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <LocaleSwitcher className="h-8 px-3 flex items-center rounded-lg hover:bg-accent/10 transition-colors text-sm" />
            <ThemeControls className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent/10 transition-colors" />
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium rounded-full hover:bg-primary/90 transition-colors shadow-card"
              >
                {tc("dashboard")}
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="hidden sm:inline-flex items-center px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {tc("login")}
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium rounded-full hover:bg-primary/90 transition-colors shadow-card"
                >
                  {tc("getStarted")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-accent/[0.03]" />
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-24 md:py-40">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <div className="mb-4">
                <span className="text-xs text-muted-foreground font-mono tracking-[0.15em] uppercase">
                  τόπος · a sense of place
                </span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight leading-[1.02] mb-6">
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
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                {t("subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 bg-foreground text-background h-11 px-7 rounded-full text-sm font-medium hover:bg-foreground/90 transition-colors shadow-card"
                  >
                    {tc("dashboard")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/sign-up"
                      className="inline-flex items-center justify-center gap-2 bg-foreground text-background h-11 px-7 rounded-full text-sm font-medium hover:bg-foreground/90 transition-colors shadow-card"
                    >
                      {tc("getStarted")}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/sign-in"
                      className="inline-flex items-center justify-center border border-border h-11 px-7 rounded-full text-sm font-medium hover:bg-accent/10 transition-colors"
                    >
                      {tc("login")}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-b border-border/40">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-24 md:py-32">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight max-w-2xl mx-auto">
                {t("featuresSubtitle")}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="bg-card border border-border/60 rounded-2xl p-8 card-hover shadow-card"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-5 ${
                      f.accent === "accent"
                        ? "bg-accent/10 text-accent"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <f.icon className="w-6 h-6" />
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

        {/* Stats */}
        <section className="border-b border-border/40 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-24 md:py-32">
            <div className="grid md:grid-cols-5 gap-12 md:gap-16 items-center">
              <div className="md:col-span-2">
                <blockquote className="space-y-6">
                  <p className="font-display text-2xl md:text-3xl leading-snug tracking-tight">
                    &ldquo;{t("testimonialQuote")}&rdquo;
                  </p>
                  <div className="border-l-2 border-accent/40 pl-5">
                    <div className="font-semibold">{t("testimonialAuthor")}</div>
                    <div className="text-sm text-muted-foreground">{t("testimonialRole")}</div>
                  </div>
                </blockquote>
              </div>
              <div className="md:col-span-3 space-y-4">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="bg-background rounded-2xl p-7 border border-border/60 flex items-center justify-between card-hover shadow-card"
                  >
                    <div className="font-display text-3xl md:text-4xl font-semibold tracking-tight tabular-nums">
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

        {/* Pricing */}
        <section id="pricing" className="border-b border-border/40">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-24 md:py-32">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight max-w-2xl mx-auto">
                {t("pricingSubtitle")}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {MARKETING_PLANS.map((plan) => (
                <div
                  key={plan.nameKey}
                  className={`relative flex flex-col rounded-2xl border transition-all duration-200 ${
                    plan.featured
                      ? "bg-foreground text-background border-foreground shadow-elevated scale-[1.03] md:scale-[1.05]"
                      : "bg-card border-border/60 card-hover shadow-card"
                  }`}
                >
                  <div className="p-8 flex flex-col flex-1">
                    <div className="mb-8">
                      <p
                        className={`text-sm font-medium mb-3 flex items-center gap-2 ${
                          plan.featured ? "text-background/60" : "text-muted-foreground"
                        }`}
                      >
                        {plan.featured && (
                          <span className="inline-flex items-center gap-1 bg-accent text-accent-foreground px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase">
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
                      className={`w-full h-11 text-sm font-medium flex items-center justify-center rounded-full transition-all border ${
                        plan.featured
                          ? "bg-background text-foreground border-background hover:bg-background/90"
                          : "bg-foreground text-background border-foreground hover:bg-foreground/90"
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

        {/* CTA */}
        <section className="relative overflow-hidden gradient-sunset-strong text-background py-28 md:py-40">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="font-display text-3xl md:text-6xl font-semibold tracking-tight mb-4">
              {t("ctaTitle")}
            </h2>
            <p className="text-base md:text-lg text-background/70 max-w-xl mx-auto leading-relaxed mb-10">
              {t("ctaDescription")}
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 bg-background text-foreground h-12 px-9 rounded-full text-sm font-medium hover:bg-background/90 transition-all shadow-elevated"
            >
              {tc("getStarted")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <Logo serif compact />
              <p className="text-xs text-muted-foreground/60">
                &copy; {new Date().getFullYear()} {APP_CONFIG.name}
              </p>
            </div>
            <nav className="flex gap-6">
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
        </div>
      </footer>
    </div>
  );
}

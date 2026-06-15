import { ArrowRight, Check, Layers, Palette, Shield } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/common/Logo";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { ThemeControls } from "@/components/ui/mode-toggle";
import { getSession } from "@/lib/auth";
import { APP_CONFIG } from "@/lib/config";
import { MARKETING_PLANS } from "@/lib/plans";

const FEATURES = [
  { icon: Layers, titleKey: "multiTenantTitle", descKey: "multiTenantDescription" },
  { icon: Palette, titleKey: "brandingTitle", descKey: "brandingDescription" },
  { icon: Shield, titleKey: "securityTitle", descKey: "securityDescription" },
];

function HeroTitle({ text }: { text: string }) {
  const [first, second] = text.split("\n");
  return (
    <h1 className="whitespace-pre-line text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[1.05] mb-6 max-w-5xl">
      <span className="block">{first}</span>
      {second && (
        <span className="block relative mt-2">
          <span className="relative z-10">{second}</span>
        </span>
      )}
    </h1>
  );
}

function Marquee({ items }: { items: { value: string; label: string }[] }) {
  return (
    <div className="border-t border-border overflow-hidden bg-foreground text-background">
      <div className="animate-marquee whitespace-nowrap py-3 font-mono text-sm">
        {items.map((item) => (
          <span key={`${item.value}-${item.label}`} className="mx-6">
            {item.value} — {item.label}
          </span>
        ))}
        {items.map((item) => (
          <span key={`${item.value}-${item.label}-copy`} className="mx-6">
            {item.value} — {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 px-6 h-full">
            <Logo showText={false} />
            <span className="font-semibold tracking-tight text-lg hidden sm:block">
              {APP_CONFIG.name}
            </span>
          </Link>

          <nav className="hidden md:flex items-center flex-1 h-full">
            <Link
              href="#features"
              className="h-full flex items-center px-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {tc("features")}
            </Link>
            <Link
              href="#pricing"
              className="h-full flex items-center px-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {tc("pricing")}
            </Link>
            <div className="h-full flex items-center px-6">
              <span className="text-xs font-medium bg-brand/15 text-brand-foreground px-2 py-1 rounded-md">
                {t("beta")}
              </span>
            </div>
          </nav>

          <div className="flex items-center h-full">
            <LocaleSwitcher className="h-full flex items-center px-4 border-l border-border hover:bg-accent transition-colors" />
            <ThemeControls className="h-full flex items-center px-4 border-l border-border hover:bg-accent transition-colors" />
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="h-full flex items-center bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
              >
                {tc("dashboard")}
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="h-full hidden sm:flex items-center px-6 text-sm font-medium text-foreground hover:bg-accent transition-colors border-l border-border"
                >
                  {tc("login")}
                </Link>
                <Link
                  href="/sign-up"
                  className="h-full flex items-center bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
                >
                  {tc("getStarted")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="border-b border-border min-h-[calc(100vh-3.5rem)] flex flex-col relative">
          <div className="w-full px-6 md:px-12 py-24 flex-1 flex items-center">
            <div className="w-full max-w-5xl mx-auto">
              <HeroTitle text={t("title")} />
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
                {t("subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center bg-foreground text-background px-8 py-3 text-sm font-medium rounded-md hover:bg-foreground/90 transition-colors shadow-sm"
                  >
                    {tc("dashboard")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/sign-up"
                      className="inline-flex items-center justify-center bg-foreground text-background px-8 py-3 text-sm font-medium rounded-md hover:bg-foreground/90 transition-colors shadow-sm"
                    >
                      {tc("getStarted")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                    <Link
                      href="/sign-in"
                      className="inline-flex items-center justify-center border border-border bg-background px-8 py-3 text-sm font-medium rounded-md hover:bg-accent transition-colors shadow-sm"
                    >
                      {tc("login")}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <Marquee items={stats} />
        </section>

        <section id="features" className="border-b border-border">
          <div className="w-full max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
            <div className="mb-14">
              <p className="text-sm font-medium text-muted-foreground tracking-wide mb-3">
                {t("featuresTitle")}
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight max-w-3xl">
                {t("featuresSubtitle")}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {FEATURES.map((f) => (
                <div
                  key={f.titleKey}
                  className="border border-border bg-card rounded-lg p-8 flex flex-col gap-5 shadow-sm hover:shadow-card-hover transition-shadow"
                >
                  <div className="w-10 h-10 bg-brand/15 text-brand-foreground flex items-center justify-center rounded-lg">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg tracking-tight">{t(f.titleKey)}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{t(f.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="w-full max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground tracking-wide mb-4">
                  {t("socialProofTitle")}
                </p>
                <blockquote className="space-y-4 relative">
                  <span
                    aria-hidden="true"
                    className="text-6xl font-semibold text-brand/30 leading-none absolute -top-4 -left-2 select-none"
                  >
                    &ldquo;
                  </span>
                  <p className="text-xl md:text-2xl leading-relaxed tracking-tight relative z-10 pl-6">
                    {t("testimonialQuote")}
                  </p>
                  <footer className="pl-6 border-l-2 border-brand/30">
                    <div className="font-medium">{t("testimonialAuthor")}</div>
                    <div className="text-sm text-muted-foreground">{t("testimonialRole")}</div>
                  </footer>
                </blockquote>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="border border-border bg-card rounded-lg p-6 flex items-center justify-between shadow-sm"
                  >
                    <div className="text-3xl md:text-4xl font-semibold tracking-tight tabular-nums">
                      {s.value}
                    </div>
                    <div className="text-sm text-muted-foreground text-right">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="border-b border-border">
          <div className="w-full max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
            <div className="mb-14">
              <p className="text-sm font-medium text-muted-foreground tracking-wide mb-3">
                {t("pricingTitle")}
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                {t("pricingSubtitle")}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {MARKETING_PLANS.map((plan) => (
                <div
                  key={plan.nameKey}
                  className={`flex flex-col p-8 rounded-lg border ${
                    plan.featured
                      ? "bg-brand text-brand-foreground border-brand shadow-elevated scale-[1.02]"
                      : "bg-card border-border shadow-sm"
                  }`}
                >
                  <div className="mb-6">
                    <p
                      className={`text-sm font-medium tracking-wide mb-3 ${plan.featured ? "text-brand-foreground/70" : "text-muted-foreground"}`}
                    >
                      {plan.featured && (
                        <span className="inline-block bg-foreground text-background px-2 py-0.5 rounded text-xs mr-2">
                          {t("popular")}
                        </span>
                      )}
                      {t(plan.nameKey)}
                    </p>
                    <div className="text-3xl font-semibold tracking-tight tabular-nums">
                      {t(plan.priceKey)}
                    </div>
                    <p
                      className={`text-sm mt-1 ${plan.featured ? "text-brand-foreground/70" : "text-muted-foreground"}`}
                    >
                      {t(plan.descKey)}
                    </p>
                  </div>
                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map((key) => (
                      <li key={key} className="flex items-center gap-3 text-sm">
                        <Check
                          className={`w-4 h-4 shrink-0 ${plan.featured ? "text-brand-foreground/50" : "text-muted-foreground"}`}
                        />
                        <span>{t(key)}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/sign-up"
                    className={`w-full h-10 text-sm font-medium flex items-center justify-center rounded-md transition-colors border shadow-sm ${
                      plan.featured
                        ? "bg-foreground text-background border-foreground hover:bg-foreground/90"
                        : "bg-foreground text-background border-foreground hover:bg-foreground/90"
                    }`}
                  >
                    {tc("getStarted")}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-foreground text-background">
          <div className="w-full max-w-4xl mx-auto px-6 md:px-12 py-16 md:py-20 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              {t("ctaTitle")}
            </h2>
            <p className="text-base md:text-lg text-background/60 max-w-xl mx-auto leading-relaxed mb-8">
              {t("ctaDescription")}
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center bg-brand text-brand-foreground px-8 py-3 text-sm font-medium rounded-md hover:bg-brand/90 transition-colors shadow-sm"
            >
              {tc("getStarted")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-foreground text-background">
        <div className="w-full max-w-6xl mx-auto px-6 md:px-12 py-10">
          <div className="flex flex-col items-center text-center gap-4 mb-8">
            <Logo inverted />
            <p className="text-sm text-background/50 max-w-md leading-relaxed">{t("subtitle")}</p>
            <span className="text-xs font-medium bg-brand/20 text-brand-foreground px-2 py-1 rounded">
              v1.0
            </span>
          </div>
          <div className="border-t border-background/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm font-mono text-background/30">
              &copy; {new Date().getFullYear()} {APP_CONFIG.name}
            </p>
            <nav className="flex gap-6">
              <Link
                href="/privacy"
                className="text-sm text-background/40 hover:text-background transition-colors"
              >
                {tc("privacy")}
              </Link>
              <Link
                href="/terms"
                className="text-sm text-background/40 hover:text-background transition-colors"
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

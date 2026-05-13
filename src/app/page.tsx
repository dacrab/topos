import { ArrowRight, Check, Layers, Palette, Shield } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/common/Logo";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { ThemeControls } from "@/components/ui/mode-toggle";
import { getSession } from "@/lib/auth";
import { APP_CONFIG } from "@/lib/config";
import { MARKETING_PLANS } from "@/lib/plans";

const FEATURE_ICONS = [Layers, Palette, Shield];

export default async function HomePage() {
  const [t, tc, session] = await Promise.all([
    getTranslations("HomePage"),
    getTranslations("Common"),
    getSession(),
  ]);

  const isLoggedIn = !!session;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="site-header">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 px-6 h-full border-r border-border">
            <Logo showText={false} />
            <span className="font-bold tracking-tighter text-lg hidden sm:block">
              {APP_CONFIG.name.toUpperCase()}
            </span>
          </Link>

          <nav className="hidden md:flex items-center flex-1 h-full">
            <Link href="#features" className="nav-link">
              {tc("features")}
            </Link>
            <Link href="#pricing" className="nav-link">
              {tc("pricing")}
            </Link>
          </nav>

          <div className="flex items-center h-full">
            <LocaleSwitcher className="h-full flex items-center px-4 border-l border-border hover:bg-secondary transition-colors" />
            <ThemeControls className="h-full flex items-center px-4 border-l border-border hover:bg-secondary transition-colors" />
            {isLoggedIn ? (
              <Link href="/dashboard" className="nav-cta">
                {tc("dashboard")}
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="nav-ghost hidden sm:flex">
                  {tc("login")}
                </Link>
                <Link href="/sign-up" className="nav-cta">
                  {tc("getStarted")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-30" />
          <div className="relative section-container py-32 md:py-44">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 border border-border px-3 py-1.5 mb-8 text-xs font-mono text-muted-foreground">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                {t("live")}
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-8">
                {t("title")}
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-12">
                {t("subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                {isLoggedIn ? (
                  <Link href="/dashboard" className="btn-primary">
                    {tc("dashboard")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                ) : (
                  <>
                    <Link href="/sign-up" className="btn-primary">
                      {tc("getStarted")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                    <Link href="/sign-in" className="btn-secondary">
                      {tc("login")}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Decorative element */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/3 h-[80%] border-l border-border hidden lg:block">
            <div className="absolute inset-0 grid-pattern-sm opacity-20" />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-border">
          <div className="section-container py-24 md:py-32">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16">
              <div>
                <p className="label-caps mb-3">{t("featuresTitle")}</p>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tighter max-w-lg">
                  {t("featuresSubtitle")}
                </h2>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
              {[
                { title: t("multiTenant"), desc: t("multiTenantDesc") },
                { title: t("customBranding"), desc: t("customBrandingDesc") },
                { title: t("security"), desc: t("securityDesc") },
              ].map((f, i) => {
                const Icon = FEATURE_ICONS[i] ?? Layers;
                return (
                  <div
                    key={f.title}
                    className="bg-background p-10 flex flex-col gap-5 group hover:bg-secondary/30 transition-colors"
                  >
                    <div className="w-10 h-10 border border-border flex items-center justify-center text-muted-foreground group-hover:border-foreground/50 group-hover:text-foreground transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-lg tracking-tight">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-t border-border bg-secondary/20">
          <div className="section-container py-24 md:py-32">
            <div className="text-center mb-16">
              <p className="label-caps mb-3">{t("pricingTitle")}</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">
                {t("pricingSubtitle")}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {MARKETING_PLANS.map((plan) => (
                <div
                  key={plan.nameKey}
                  className={`flex flex-col p-8 transition-all ${
                    plan.featured
                      ? "bg-foreground text-background border-2 border-foreground scale-[1.02] shadow-2xl"
                      : "bg-background border border-border hover:border-foreground/30"
                  }`}
                >
                  <div className="mb-8">
                    <p
                      className={`text-xs font-bold uppercase tracking-widest mb-4 ${plan.featured ? "text-background/60" : "text-muted-foreground"}`}
                    >
                      {t(plan.nameKey)}
                    </p>
                    <div className="text-4xl font-bold tracking-tighter font-mono">
                      {t(plan.priceKey)}
                    </div>
                    <p
                      className={`text-sm mt-2 ${plan.featured ? "text-background/60" : "text-muted-foreground"}`}
                    >
                      {t(plan.descKey)}
                    </p>
                  </div>

                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map((key) => (
                      <li key={key} className="flex items-center gap-3 text-sm">
                        <Check
                          className={`w-4 h-4 shrink-0 ${plan.featured ? "text-background/50" : "text-muted-foreground"}`}
                        />
                        <span>{t(key)}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/sign-up"
                    className={`w-full h-12 text-xs font-bold uppercase tracking-widest flex items-center justify-center transition-colors ${
                      plan.featured
                        ? "bg-background text-foreground hover:bg-background/90"
                        : "bg-foreground text-background hover:bg-foreground/90"
                    }`}
                  >
                    {tc("getStarted")}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border">
          <div className="section-container py-24 md:py-32 text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-6">{t("title")}</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-10">{t("subtitle")}</p>
            <Link href="/sign-up" className="btn-primary">
              {tc("getStarted")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-foreground text-background">
        <div className="section-container py-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo inverted />
          <nav className="flex gap-6 text-xs font-mono text-background/50">
            <Link href="/privacy" className="hover:text-background transition-colors">
              {tc("privacy")}
            </Link>
            <Link href="/terms" className="hover:text-background transition-colors">
              {tc("terms")}
            </Link>
          </nav>
          <p className="text-xs font-mono text-background/40">
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}
          </p>
        </div>
      </footer>
    </div>
  );
}

import { Check } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/common/Logo";
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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 grid-pattern opacity-40" />
      </div>

      <header className="site-header">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center justify-center w-20 h-16 border-r border-border hover:bg-secondary transition-colors"
          >
            <Logo showText={false} />
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
            <div className="hidden md:flex items-center h-full border-l border-border px-4 gap-2">
              <ThemeControls />
            </div>
            {isLoggedIn ? (
              <Link href="/dashboard" className="nav-cta border-l border-border">
                {tc("dashboard")}
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="nav-ghost">
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

      <main className="flex-1 relative z-10">
        {/* Hero */}
        <section className="section-container py-32 md:py-48">
          <div className="max-w-4xl">
            <p className="label-caps mb-6">{t("live")}</p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-8 whitespace-pre-line">
              {t("title")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl font-light leading-relaxed mb-12">
              {t("subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {isLoggedIn ? (
                <Link href="/dashboard" className="btn-primary">
                  {tc("dashboard")}
                </Link>
              ) : (
                <>
                  <Link href="/sign-up" className="btn-primary">
                    {tc("getStarted")}
                  </Link>
                  <Link href="/sign-in" className="btn-secondary">
                    {tc("login")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-border">
          <div className="section-container py-24">
            <p className="label-caps mb-4">{t("featuresTitle")}</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-16 max-w-xl">
              {t("featuresSubtitle")}
            </h2>
            <div className="grid md:grid-cols-3 border-t border-l border-border">
              {[
                { title: t("multiTenant"), desc: t("multiTenantDesc") },
                { title: t("customBranding"), desc: t("customBrandingDesc") },
                { title: t("security"), desc: t("securityDesc") },
              ].map((f) => (
                <div key={f.title} className="border-r border-b border-border p-8 space-y-3">
                  <h3 className="font-bold text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-t border-border">
          <div className="section-container py-24">
            <p className="label-caps mb-4">{t("pricingTitle")}</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-16">
              {t("pricingSubtitle")}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {MARKETING_PLANS.map((plan) => (
                <div
                  key={plan.nameKey}
                  className={`p-8 border flex-col ${plan.featured ? "bg-foreground text-background border-foreground" : "bg-background border-border"}`}
                >
                  <div className="mb-6">
                    <h3
                      className={`text-xs font-bold uppercase tracking-widest mb-3 ${plan.featured ? "text-background/70" : "text-muted-foreground"}`}
                    >
                      {t(plan.nameKey)}
                    </h3>
                    <div className="text-5xl font-bold tracking-tighter mb-2">
                      {t(plan.priceKey)}
                    </div>
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
        </section>
      </main>

      <footer className="relative z-10 bg-foreground text-background py-8 border-t border-border">
        <div className="section-container flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/">
            <Logo inverted />
          </Link>
          <p className="text-xs font-mono text-background/60">
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}. {tc("rightsReserved")}
          </p>
        </div>
      </footer>
    </div>
  );
}

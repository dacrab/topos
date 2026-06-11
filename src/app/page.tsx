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

export default async function HomePage() {
  const [t, tc, session] = await Promise.all([
    getTranslations("HomePage"),
    getTranslations("Common"),
    getSession(),
  ]);

  const isLoggedIn = !!session;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
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
            <ThemeControls className="h-full flex items-center px-4 border-x border-border hover:bg-secondary transition-colors" />
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
        <section className="border-b border-border min-h-[calc(100vh-3.5rem)] flex items-center">
          <div className="w-full px-6 md:px-12 py-24">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.85] mb-6 max-w-5xl">
              {t("title")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
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
        </section>

        <section id="features" className="border-b border-border">
          <div className="w-full px-6 md:px-12 py-16 md:py-24">
            <div className="mb-10">
              <p className="label-caps mb-2">{t("featuresTitle")}</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tighter max-w-3xl">
                {t("featuresSubtitle")}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
              {FEATURES.map((f, i) => (
                <div
                  key={f.titleKey}
                  className={`bg-background p-8 flex flex-col gap-4 group hover:bg-secondary/30 transition-colors ${
                    i === 0 ? "md:col-span-2 md:row-span-2" : ""
                  }`}
                >
                  <div
                    className={`border border-border flex items-center justify-center text-muted-foreground group-hover:border-foreground/50 group-hover:text-foreground transition-colors ${
                      i === 0 ? "w-14 h-14" : "w-10 h-10"
                    }`}
                  >
                    <f.icon className={i === 0 ? "w-7 h-7" : "w-5 h-5"} />
                  </div>
                  <h3 className={`font-bold tracking-tight ${i === 0 ? "text-2xl" : "text-lg"}`}>
                    {t(f.titleKey)}
                  </h3>
                  <p
                    className={`text-muted-foreground leading-relaxed ${i === 0 ? "text-base" : "text-sm"}`}
                  >
                    {t(f.descKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="w-full px-6 md:px-12 py-16 md:py-24">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <p className="label-caps mb-4">{t("socialProofTitle")}</p>
                <blockquote className="space-y-4">
                  <p className="text-2xl md:text-3xl font-light leading-snug tracking-tight">
                    &ldquo;{t("testimonialQuote")}&rdquo;
                  </p>
                  <footer>
                    <div className="font-semibold">{t("testimonialAuthor")}</div>
                    <div className="text-sm text-muted-foreground uppercase tracking-widest">
                      {t("testimonialRole")}
                    </div>
                  </footer>
                </blockquote>
              </div>
              <div className="grid grid-cols-3 gap-px bg-border border border-border">
                {[
                  { value: t("stat1Value"), label: t("stat1Label") },
                  { value: t("stat2Value"), label: t("stat2Label") },
                  { value: t("stat3Value"), label: t("stat3Label") },
                ].map((s) => (
                  <div key={s.label} className="bg-background p-6 text-center">
                    <div className="text-2xl md:text-3xl font-bold tracking-tighter font-mono mb-1">
                      {s.value}
                    </div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="border-b border-border bg-secondary/20">
          <div className="w-full px-6 md:px-12 py-16 md:py-24">
            <div className="mb-10">
              <p className="label-caps mb-2">{t("pricingTitle")}</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">
                {t("pricingSubtitle")}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {MARKETING_PLANS.map((plan) => (
                <div
                  key={plan.nameKey}
                  className={`flex flex-col p-8 transition-all ${
                    plan.featured
                      ? "bg-foreground text-background border-2 border-foreground scale-[1.02] shadow-2xl"
                      : "bg-background border border-border hover:border-foreground/30"
                  }`}
                >
                  <div className="mb-6">
                    <p
                      className={`text-xs font-bold uppercase tracking-widest mb-3 ${plan.featured ? "text-background/60" : "text-muted-foreground"}`}
                    >
                      {t(plan.nameKey)}
                    </p>
                    <div className="text-4xl font-bold tracking-tighter font-mono">
                      {t(plan.priceKey)}
                    </div>
                    <p
                      className={`text-sm mt-1 ${plan.featured ? "text-background/60" : "text-muted-foreground"}`}
                    >
                      {t(plan.descKey)}
                    </p>
                  </div>
                  <ul className="space-y-2 flex-1 mb-6">
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
      </main>

      <footer className="bg-foreground text-background">
        <div className="w-full px-6 md:px-12 py-10">
          <div className="flex flex-col items-center text-center gap-4 mb-8">
            <Logo inverted />
            <p className="text-sm text-background/50 max-w-md leading-relaxed">{t("subtitle")}</p>
          </div>
          <div className="border-t border-background/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-mono text-background/30">
              &copy; {new Date().getFullYear()} {APP_CONFIG.name}
            </p>
            <nav className="flex gap-6">
              <Link
                href="/privacy"
                className="text-xs font-mono text-background/40 hover:text-background transition-colors"
              >
                {tc("privacy")}
              </Link>
              <Link
                href="/terms"
                className="text-xs font-mono text-background/40 hover:text-background transition-colors"
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

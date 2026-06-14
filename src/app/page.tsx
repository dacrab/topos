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
    <h1 className="whitespace-pre-line text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.85] mb-6 max-w-5xl">
      <span className="block">{first}</span>
      {second && (
        <span className="block relative mt-2">
          <span className="relative z-10">{second}</span>
          <span className="absolute inset-x-[-8px] inset-y-[-4px] bg-brand -skew-x-2 z-0 hidden md:block" />
        </span>
      )}
    </h1>
  );
}

function Marquee({ items }: { items: { value: string; label: string }[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="border-t-2 border-foreground overflow-hidden bg-foreground text-background">
      <div className="animate-marquee whitespace-nowrap py-3 font-mono text-xs font-bold uppercase tracking-widest">
        {doubled.map((item) => (
          <span key={`${item.value}-${item.label}`} className="mx-8">
            ★ {item.value} {item.label}
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
      <header className="sticky top-0 z-50 w-full border-b-2 border-foreground bg-background/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-6 h-full border-r-2 border-foreground"
          >
            <Logo showText={false} />
            <span className="font-bold tracking-tighter text-lg hidden sm:block">
              {APP_CONFIG.name.toUpperCase()}
            </span>
          </Link>

          <nav className="hidden md:flex items-center flex-1 h-full">
            <Link
              href="#features"
              className="h-full flex items-center border-r-2 border-foreground px-8 text-xs font-bold uppercase tracking-widest text-foreground hover:bg-brand hover:text-brand-foreground transition-colors"
            >
              {tc("features")}
            </Link>
            <Link
              href="#pricing"
              className="h-full flex items-center border-r-2 border-foreground px-8 text-xs font-bold uppercase tracking-widest text-foreground hover:bg-brand hover:text-brand-foreground transition-colors"
            >
              {tc("pricing")}
            </Link>
            <div className="h-full flex items-center px-6">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-brand text-brand-foreground px-2 py-1">
                {tc("beta")}
              </span>
            </div>
          </nav>

          <div className="flex items-center h-full">
            <LocaleSwitcher className="h-full flex items-center px-4 border-l-2 border-foreground hover:bg-brand hover:text-brand-foreground transition-colors" />
            <ThemeControls className="h-full flex items-center px-4 border-x-2 border-foreground hover:bg-brand hover:text-brand-foreground transition-colors" />
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="h-full flex items-center bg-foreground px-8 text-xs font-bold uppercase tracking-widest text-background hover:bg-brand hover:text-brand-foreground transition-colors"
              >
                {tc("dashboard")}
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="h-full hidden sm:flex items-center border-l-2 border-foreground px-8 text-xs font-bold uppercase tracking-widest text-foreground hover:bg-brand hover:text-brand-foreground transition-colors"
                >
                  {tc("login")}
                </Link>
                <Link
                  href="/sign-up"
                  className="h-full flex items-center bg-foreground px-8 text-xs font-bold uppercase tracking-widest text-background hover:bg-brand hover:text-brand-foreground transition-colors"
                >
                  {tc("getStarted")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ─── Hero ─── */}
        <section className="border-b-2 border-foreground min-h-[calc(100vh-3.5rem)] flex flex-col relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute top-1/2 right-0 -translate-y-1/2 text-[35vw] font-bold text-foreground/[0.04] select-none pointer-events-none leading-none hidden md:block"
          >
            T
          </div>

          <div className="w-full px-6 md:px-12 py-24 flex-1 flex items-center relative z-10">
            <div className="w-full">
              <HeroTitle text={t("title")} />
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
                {t("subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center bg-brand text-brand-foreground px-10 py-4 text-xs font-bold uppercase tracking-widest brutal-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
                  >
                    {tc("dashboard")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/sign-up"
                      className="inline-flex items-center justify-center bg-brand text-brand-foreground px-10 py-4 text-xs font-bold uppercase tracking-widest brutal-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
                    >
                      {tc("getStarted")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                    <Link
                      href="/sign-in"
                      className="inline-flex items-center justify-center border-2 border-foreground px-10 py-4 text-xs font-bold uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background transition-colors"
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

        {/* ─── Features ─── */}
        <section id="features" className="border-b-2 border-foreground">
          <div className="w-full px-6 md:px-12 py-16 md:py-24">
            <div className="mb-14">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-1 bg-brand" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {t("featuresTitle")}
                </p>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tighter max-w-3xl">
                {t("featuresSubtitle")}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => (
                <div
                  key={f.titleKey}
                  className={`border-2 border-foreground bg-card p-8 flex flex-col gap-5 brutal-shadow ${
                    i === 0 ? "md:col-span-2 md:row-span-1" : ""
                  }`}
                >
                  <div className="w-12 h-12 bg-brand text-brand-foreground flex items-center justify-center">
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-xl tracking-tight">{t(f.titleKey)}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{t(f.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Social Proof ─── */}
        <section className="border-b-2 border-foreground">
          <div className="w-full px-6 md:px-12 py-16 md:py-24">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-1 bg-brand" />
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {t("socialProofTitle")}
                  </p>
                </div>
                <blockquote className="space-y-4 relative">
                  <span
                    aria-hidden="true"
                    className="text-8xl font-bold text-brand leading-none absolute -top-6 -left-2 select-none"
                  >
                    &ldquo;
                  </span>
                  <p className="text-2xl md:text-3xl font-light leading-snug tracking-tight relative z-10 pl-6">
                    {t("testimonialQuote")}
                  </p>
                  <footer className="pl-6 border-l-2 border-foreground">
                    <div className="font-bold">{t("testimonialAuthor")}</div>
                    <div className="text-sm text-muted-foreground uppercase tracking-widest">
                      {t("testimonialRole")}
                    </div>
                  </footer>
                </blockquote>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="border-2 border-foreground p-6 flex items-center justify-between brutal-shadow-sm"
                  >
                    <div className="text-3xl md:text-4xl font-bold tracking-tighter font-mono">
                      {s.value}
                    </div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground text-right">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Pricing ─── */}
        <section id="pricing" className="border-b-2 border-foreground">
          <div className="w-full px-6 md:px-12 py-16 md:py-24">
            <div className="mb-14">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-1 bg-brand" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {t("pricingTitle")}
                </p>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tighter">
                {t("pricingSubtitle")}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {MARKETING_PLANS.map((plan) => (
                <div
                  key={plan.nameKey}
                  className={`flex flex-col p-8 border-2 border-foreground ${
                    plan.featured
                      ? "bg-brand text-brand-foreground brutal-shadow scale-[1.02]"
                      : "bg-card"
                  }`}
                >
                  <div className="mb-6">
                    <p
                      className={`text-xs font-bold uppercase tracking-widest mb-3 ${plan.featured ? "text-brand-foreground/60" : "text-muted-foreground"}`}
                    >
                      {plan.featured && (
                        <span className="inline-block bg-foreground text-background px-2 py-0.5 mr-2 text-[10px]">
                          {t("popular")}
                        </span>
                      )}
                      {t(plan.nameKey)}
                    </p>
                    <div className="text-4xl font-bold tracking-tighter font-mono">
                      {t(plan.priceKey)}
                    </div>
                    <p
                      className={`text-sm mt-1 ${plan.featured ? "text-brand-foreground/60" : "text-muted-foreground"}`}
                    >
                      {t(plan.descKey)}
                    </p>
                  </div>
                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map((key) => (
                      <li key={key} className="flex items-center gap-3 text-sm">
                        <Check
                          className={`w-4 h-4 shrink-0 ${plan.featured ? "text-brand-foreground/60" : "text-muted-foreground"}`}
                        />
                        <span>{t(key)}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/sign-up"
                    className={`w-full h-12 text-xs font-bold uppercase tracking-widest flex items-center justify-center transition-colors border-2 border-foreground ${
                      plan.featured
                        ? "bg-foreground text-background hover:bg-foreground/90 brutal-shadow-sm"
                        : "bg-foreground text-background hover:bg-foreground/90 brutal-shadow-sm"
                    }`}
                  >
                    {tc("getStarted")}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="border-b-2 border-foreground bg-foreground text-background">
          <div className="w-full px-6 md:px-12 py-16 md:py-20 text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">
              {t("ctaTitle")}
            </h2>
            <p className="text-base md:text-lg text-background/60 max-w-xl mx-auto leading-relaxed mb-8">
              {t("ctaDescription")}
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center bg-brand text-brand-foreground px-10 py-4 text-xs font-bold uppercase tracking-widest brutal-shadow-brand hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform"
            >
              {tc("getStarted")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-foreground text-background">
        <div className="w-full px-6 md:px-12 py-10">
          <div className="flex flex-col items-center text-center gap-4 mb-8">
            <Logo inverted />
            <p className="text-sm text-background/50 max-w-md leading-relaxed">{t("subtitle")}</p>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-brand text-brand-foreground px-2 py-1">
              v1.0
            </span>
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

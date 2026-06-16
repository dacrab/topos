import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/common/Logo";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="site-header">
        <div className="flex h-14 items-center justify-between max-w-6xl mx-auto px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo showText={false} />
            <span className="font-bold tracking-tight text-lg hidden sm:block">
              {APP_CONFIG.name}
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <LocaleSwitcher className="h-8 px-3 flex items-center rounded-lg hover:bg-secondary transition-colors text-sm" />
            <ThemeControls className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors" />
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
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
                  className="inline-flex items-center justify-center bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {tc("getStarted")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-border/40">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 py-20 md:py-32 items-center">
              <div>
                <Badge variant="primary" className="mb-5">
                  {t("beta")}
                </Badge>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
                  {t("title")
                    .split("\n")
                    .map((line, i) => (
                      <span key={line} className={i === 1 ? "block mt-2 text-primary" : "block"}>
                        {line}
                      </span>
                    ))}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
                  {t("subtitle")}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {isLoggedIn ? (
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center gap-2 bg-foreground text-background h-11 px-7 rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
                    >
                      {tc("dashboard")}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/sign-up"
                        className="inline-flex items-center justify-center gap-2 bg-foreground text-background h-11 px-7 rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
                      >
                        {tc("getStarted")}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/sign-in"
                        className="inline-flex items-center justify-center border border-border h-11 px-7 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                      >
                        {tc("login")}
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <div className="hidden md:block relative">
                <div className="aspect-[4/3] rounded-xl bg-secondary border border-border/60 overflow-hidden relative">
                  <div className="absolute inset-0 grid-pattern-dot opacity-40" />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="w-full space-y-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                        <span className="w-2 h-2 rounded-full bg-primary/60" />
                        dashboard &middot; topos.app
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { val: 54, label: "listings" },
                          { val: 128, label: "contacts" },
                          { val: "€2.4M", label: "volume" },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-xl bg-card border border-border/60 p-4 shadow-card"
                          >
                            <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                            <div className="text-lg font-bold tabular-nums">{item.val}</div>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-xl bg-card border border-border/60 p-4 shadow-card">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-xs font-medium text-muted-foreground">
                            recent activity
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">today</div>
                        </div>
                        <div className="space-y-2.5">
                          {["new listing added", "lead inquiry received", "deal closed"].map(
                            (a) => (
                              <div key={a} className="flex items-center gap-2.5 text-xs">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                                <span className="text-foreground">{a}</span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-b border-border/40">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-24 md:py-32">
            <div className="max-w-2xl mb-16">
              <p className="label-caps mb-4">{t("featuresTitle")}</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                {t("featuresSubtitle")}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="rounded-xl bg-card border border-border/60 p-8 md:p-10 md:row-span-2 flex flex-col justify-between card-hover">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                      <title>Multi-tenant</title>
                      <path
                        d="M4 7L12 3L20 7V17L12 21L4 17V7Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                        fill="none"
                      />
                      <path d="M12 3V21" stroke="currentColor" strokeWidth="1.5" />
                      <path
                        d="M4 7L12 11L20 7"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight mb-3">{t("multiTenantTitle")}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm max-w-sm">
                    {t("multiTenantDescription")}
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-card border border-border/60 p-8 card-hover">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                    <title>Branding</title>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-3">{t("brandingTitle")}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {t("brandingDescription")}
                </p>
              </div>
              <div className="rounded-xl bg-card border border-border/60 p-8 card-hover">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                    <title>Security</title>
                    <rect
                      x="3"
                      y="11"
                      width="18"
                      height="10"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-3">{t("securityTitle")}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {t("securityDescription")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border/40">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-24 md:py-32">
            <div className="grid md:grid-cols-5 gap-12 md:gap-16 items-start">
              <div className="md:col-span-2 md:sticky md:top-32">
                <p className="label-caps mb-4">{t("socialProofTitle")}</p>
                <h2 className="text-3xl font-bold tracking-tight mb-6">{t("testimonialQuote")}</h2>
                <div className="border-l-2 border-primary/30 pl-5">
                  <div className="font-semibold">{t("testimonialAuthor")}</div>
                  <div className="text-sm text-muted-foreground">{t("testimonialRole")}</div>
                </div>
              </div>
              <div className="md:col-span-3 space-y-4">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="bg-card rounded-xl p-7 border border-border/60 flex items-center justify-between card-hover"
                  >
                    <div className="text-3xl md:text-4xl font-bold tracking-tight tabular-nums">
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

        <section id="pricing" className="border-b border-border/40">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-24 md:py-32">
            <div className="max-w-2xl mb-16">
              <p className="label-caps mb-4">{t("pricingTitle")}</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                {t("pricingSubtitle")}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {MARKETING_PLANS.map((plan) => (
                <div
                  key={plan.nameKey}
                  className={`flex flex-col p-8 rounded-xl border transition-all duration-200 ${
                    plan.featured
                      ? "bg-foreground text-background border-foreground shadow-lg"
                      : "bg-card border-border/60 card-hover"
                  }`}
                >
                  <div className="mb-8">
                    <p
                      className={`text-sm font-medium mb-3 ${plan.featured ? "text-background/60" : "text-muted-foreground"}`}
                    >
                      {plan.featured && (
                        <span className="inline-block bg-primary text-primary-foreground px-2.5 py-0.5 rounded-md text-xs font-semibold mr-2">
                          {t("popular")}
                        </span>
                      )}
                      {t(plan.nameKey)}
                    </p>
                    <div className="text-4xl font-bold tracking-tight tabular-nums">
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
                          className={`w-4 h-4 shrink-0 ${plan.featured ? "text-background/40" : "text-primary"}`}
                        />
                        <span>{t(key)}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/sign-up"
                    className={`w-full h-11 text-sm font-medium flex items-center justify-center rounded-lg transition-colors border ${
                      plan.featured
                        ? "bg-background text-foreground border-background hover:bg-background/90"
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

        <section className="bg-foreground text-background relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern-dot opacity-[0.04]" />
          <div className="max-w-4xl mx-auto px-6 md:px-12 py-24 md:py-28 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">{t("ctaTitle")}</h2>
            <p className="text-base md:text-lg text-background/60 max-w-xl mx-auto leading-relaxed mb-8">
              {t("ctaDescription")}
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground h-12 px-8 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {tc("getStarted")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
          <div className="flex flex-col items-center text-center gap-4 mb-10">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
          <div className="border-t border-border/40 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground/60">
              &copy; {new Date().getFullYear()} {APP_CONFIG.name}
            </p>
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

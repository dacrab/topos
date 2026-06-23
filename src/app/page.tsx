import { ArrowRight, Check } from "lucide-react";
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
                className="inline-flex items-center justify-center bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-card"
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
                  className="inline-flex items-center justify-center bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-card"
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
              <div className="animate-fade-up">
                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.02] mb-6">
                  {t("title")
                    .split("\n")
                    .map((line, i) => (
                      <span
                        key={line}
                        className={i === 1 ? "block mt-2 text-primary italic" : "block"}
                      >
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
                      className="inline-flex items-center justify-center gap-2 bg-foreground text-background h-11 px-7 rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors shadow-card"
                    >
                      {tc("dashboard")}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/sign-up"
                        className="inline-flex items-center justify-center gap-2 bg-foreground text-background h-11 px-7 rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors shadow-card"
                      >
                        {tc("getStarted")}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/sign-in"
                        className="inline-flex items-center justify-center border border-border h-11 px-7 rounded-lg text-sm font-medium hover:bg-accent/10 transition-colors"
                      >
                        {tc("login")}
                      </Link>
                    </>
                  )}
                </div>
              </div>
              <div className="hidden md:flex flex-col items-center justify-center py-12">
                <div className="w-28 h-28 text-accent mb-6">
                  <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
                    <title>{`${APP_CONFIG.name} Logo`}</title>
                    <path
                      d="M6.5 13L16 5.5L25.5 13V23L16 27.5L6.5 23V13Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6.5 13L16 18L25.5 13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 18V27.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="font-display text-4xl font-semibold text-foreground tracking-tight">
                  τόπος
                </p>
                <p className="text-sm text-muted-foreground font-mono mt-2 tracking-wide">
                  a sense of place
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-b border-border/40">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-24 md:py-32">
            <div className="max-w-2xl mb-16">
              <p className="label-caps mb-4">{t("featuresTitle")}</p>
              <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight">
                {t("featuresSubtitle")}
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="rounded-xl bg-card border border-border/60 p-8 md:p-10 md:row-span-2 flex flex-col justify-between card-hover shadow-card">
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
                  <h3 className="font-display text-xl font-semibold tracking-tight mb-3">
                    {t("multiTenantTitle")}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm max-w-sm">
                    {t("multiTenantDescription")}
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-card border border-border/60 p-8 card-hover shadow-card">
                <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center mb-5">
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                    <title>Branding</title>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <h3 className="font-display text-xl font-semibold tracking-tight mb-3">
                  {t("brandingTitle")}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {t("brandingDescription")}
                </p>
              </div>
              <div className="rounded-xl bg-card border border-border/60 p-8 card-hover shadow-card">
                <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center mb-5">
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
                <h3 className="font-display text-xl font-semibold tracking-tight mb-3">
                  {t("securityTitle")}
                </h3>
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
                <h2 className="font-display text-3xl font-medium tracking-tight mb-6">
                  {t("testimonialQuote")}
                </h2>
                <div className="border-l-2 border-primary/30 pl-5">
                  <div className="font-semibold">{t("testimonialAuthor")}</div>
                  <div className="text-sm text-muted-foreground">{t("testimonialRole")}</div>
                </div>
              </div>
              <div className="md:col-span-3 space-y-4">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="bg-card rounded-xl p-7 border border-border/60 flex items-center justify-between card-hover shadow-card"
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

        <section id="pricing" className="border-b border-border/40">
          <div className="max-w-6xl mx-auto px-6 md:px-12 py-24 md:py-32">
            <div className="max-w-2xl mb-16">
              <p className="label-caps mb-4">{t("pricingTitle")}</p>
              <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight">
                {t("pricingSubtitle")}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {MARKETING_PLANS.map((plan) => (
                <div
                  key={plan.nameKey}
                  className={`flex flex-col p-8 rounded-xl border transition-all duration-200 ${
                    plan.featured
                      ? "bg-foreground text-background border-foreground shadow-elevated"
                      : "bg-card border-border/60 card-hover shadow-card"
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
                    <div className="font-display text-4xl font-semibold tracking-tight tabular-nums">
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

        <section className="bg-foreground text-background py-24 md:py-32">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight mb-4">
              {t("ctaTitle")}
            </h2>
            <p className="text-base md:text-lg text-background/60 max-w-xl mx-auto leading-relaxed mb-8">
              {t("ctaDescription")}
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground h-12 px-8 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-card"
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
            <Logo serif />
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

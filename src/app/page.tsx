import { auth } from "@clerk/nextjs/server";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/common/Logo";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { ThemeControls } from "@/components/ui/mode-toggle";
import { APP_CONFIG } from "@/lib/config";
import { MARKETING_PLANS } from "@/lib/plans";

export default async function HomePage() {
  const [t, tc, { userId }] = await Promise.all([
    getTranslations("HomePage"),
    getTranslations("Common"),
    auth(),
  ]);

  const isLoggedIn = !!userId;

  const clientFeatures = [
    t("forClientsF1"),
    t("forClientsF2"),
    t("forClientsF3"),
    t("forClientsF4"),
    t("forClientsF5"),
  ];

  const teamFeatures = [
    t("forTeamF1"),
    t("forTeamF2"),
    t("forTeamF3"),
    t("forTeamF4"),
    t("forTeamF5"),
    t("forTeamF6"),
  ];

  const steps = [
    { title: t("step1Title"), desc: t("step1Desc") },
    { title: t("step2Title"), desc: t("step2Desc") },
    { title: t("step3Title"), desc: t("step3Desc") },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="site-header">
        <div className="shell h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo showText={false} />
            <span className="font-display font-medium tracking-tight text-lg hidden sm:block group-hover:text-primary transition-colors">
              {APP_CONFIG.name}
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            <LocaleSwitcher className="h-9 px-3 flex items-center rounded-lg hover:bg-secondary/60 transition-colors text-sm" />
            <ThemeControls className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-secondary/60 transition-colors" />
            {isLoggedIn ? (
              <Link href="/dashboard" className="btn-primary btn-sm">
                {tc("dashboard")}
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="inline-flex items-center px-4 h-9 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/60"
              >
                {tc("login")}
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* ── HERO — what it is, who it's for, how to start ── */}
        <section className="border-b border-border">
          <div className="shell pt-20 md:pt-32 pb-16 md:pb-24">
            <h1 className="font-display text-5xl md:text-hero-1 font-medium tracking-tight leading-[1.05] mb-6 max-w-4xl">
              {t("title")
                .split("\n")
                .map((line, i) => (
                  <span key={line} className="block">
                    {i === 1 ? <em className="text-primary italic">{line}</em> : line}
                  </span>
                ))}
            </h1>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
              <div className="space-y-3 max-w-xl">
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  {t("subtitle")}
                </p>
                <p className="text-sm text-muted-foreground/80">{t("positioning")}</p>
              </div>

              <div className="shrink-0 md:text-right space-y-3">
                {isLoggedIn ? (
                  <Link href="/dashboard" className="btn-primary btn-lg">
                    {tc("dashboard")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link href="/sign-up" className="btn-primary btn-lg">
                    {tc("getStarted")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                <p className="text-xs text-muted-foreground">{t("freeFacts")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHAT'S INCLUDED — the two real audiences ── */}
        <section id="features" className="border-b border-border">
          <div className="shell py-16 md:py-24">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-10">
              {t("featuresSubtitle")}
            </h2>

            <div className="grid md:grid-cols-2 gap-10 md:gap-14">
              <div>
                <h3 className="text-lg font-semibold tracking-tight mb-1.5">
                  {t("forClientsTitle")}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">{t("forClientsDesc")}</p>
                <ul className="space-y-3">
                  {clientFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold tracking-tight mb-1.5">{t("forTeamTitle")}</h3>
                <p className="text-sm text-muted-foreground mb-6">{t("forTeamDesc")}</p>
                <ul className="space-y-3">
                  {teamFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS — three concrete steps ── */}
        <section className="border-b border-border">
          <div className="shell py-16 md:py-24">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-10">
              {t("howTagline")}
            </h2>

            <div className="grid md:grid-cols-3 gap-8 md:gap-10">
              {steps.map((s, i) => (
                <div key={s.title} className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-semibold tabular-nums">
                      {i + 1}
                    </span>
                    <h3 className="text-base font-semibold tracking-tight">{s.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIAL — one real quote, quiet ── */}
        <section className="border-b border-border">
          <div className="shell py-16 md:py-20">
            <blockquote className="max-w-3xl">
              <p className="text-xl md:text-2xl font-medium tracking-tight leading-snug text-foreground">
                &ldquo;{t("testimonialQuote")}&rdquo;
              </p>
              <footer className="mt-5 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{t("testimonialAuthor")}</span>
                {" · "}
                {t("testimonialRole")}
              </footer>
            </blockquote>
          </div>
        </section>

        {/* ── PRICING — flat columns, hairline-separated ── */}
        <section id="pricing" className="border-b border-border">
          <div className="shell py-16 md:py-24">
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
                {t("pricingTitle")}
              </h2>
              <p className="text-muted-foreground">{t("pricingSubtitle")}</p>
            </div>

            <div className="grid md:grid-cols-3 border-t border-border">
              {MARKETING_PLANS.map((plan, i) => (
                <div
                  key={plan.nameKey}
                  className={`flex flex-col p-7 md:p-8 ${
                    i > 0 ? "border-t md:border-t-0 md:border-l border-border" : ""
                  } ${plan.featured ? "bg-primary/[0.03]" : ""}`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <p className="text-sm font-semibold">{t(plan.nameKey)}</p>
                    {plan.featured && (
                      <span className="text-micro font-semibold uppercase tracking-wide text-primary">
                        {t("popular")}
                      </span>
                    )}
                  </div>

                  <div className="text-4xl font-semibold tracking-tight tabular-nums mb-2">
                    {t(plan.priceKey)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-8">{t(plan.descKey)}</p>

                  <ul className="space-y-2.5 flex-1 mb-8">
                    {plan.features.map((key) => (
                      <li key={key} className="flex items-start gap-3 text-sm">
                        <Check className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                        <span className="text-muted-foreground">{t(key)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CLOSE — heading, one action ── */}
        <section className="border-b border-border">
          <div className="shell py-16 md:py-20 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{t("ctaHeading")}</h2>
            <Link href="/sign-up" className="btn-primary btn-lg shrink-0">
              {tc("getStarted")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="shell py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <Link
              href="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <Logo showText={false} />
              <span className="font-display font-medium tracking-tight">{APP_CONFIG.name}</span>
            </Link>

            <nav className="flex gap-6 items-baseline">
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

            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {APP_CONFIG.name}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

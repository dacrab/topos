import { count, eq } from "drizzle-orm";
import { ArrowRight, Check, Globe, Layout, Lock, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/common/Logo";
import { ThemeLocaleControls } from "@/components/ui/language-toggle";
import { listing, tenant, user } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { APP_CONFIG } from "@/lib/config";
import { db } from "@/lib/db";
import { MARKETING_PLANS } from "@/lib/plans";

type T = ReturnType<typeof useTranslations>;

type PlatformStats = {
  tenantCount: number;
  listingCount: number;
  userCount: number;
};

async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const [tenantResult, listingResult, userResult] = await Promise.all([
      db.select({ count: count() }).from(tenant),
      db.select({ count: count() }).from(listing).where(eq(listing.status, "PUBLISHED")),
      db.select({ count: count() }).from(user),
    ]);
    return {
      tenantCount: tenantResult[0]?.count ?? 0,
      listingCount: listingResult[0]?.count ?? 0,
      userCount: userResult[0]?.count ?? 0,
    };
  } catch {
    return { tenantCount: 0, listingCount: 0, userCount: 0 };
  }
}

async function getTrustedTenants(): Promise<string[]> {
  try {
    const tenants = await db.select({ name: tenant.name }).from(tenant).limit(5);
    return tenants.map((t) => t.name);
  } catch {
    return [];
  }
}

const NAV_ITEMS = ["product", "solutions", "pricing"] as const;

function Header({ tc, isLoggedIn }: { tc: T; isLoggedIn: boolean }) {
  return (
    <header className="site-header">
      <div className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center justify-center w-20 h-16 border-r border-border hover:bg-secondary transition-colors"
        >
          <Logo showText={false} />
        </Link>

        <nav className="hidden md:flex items-center flex-1 h-full">
          {NAV_ITEMS.map((key) => (
            <Link key={key} href={`#${key === "product" ? "features" : key}`} className="nav-link">
              {tc(key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center h-full">
          <div className="hidden md:flex items-center h-full border-l border-border px-4 gap-2">
            <ThemeLocaleControls />
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
  );
}

function HeroSection({
  t,
  tc,
  stats,
  isLoggedIn,
}: {
  t: T;
  tc: T;
  stats: PlatformStats;
  isLoggedIn: boolean;
}) {
  return (
    <section className="relative border-b border-border">
      <div className="grid lg:grid-cols-2 min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col justify-center p-8 md:p-16 lg:p-20 border-r border-border bg-background">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-2 h-2 bg-foreground animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              {t("live")}
            </span>
          </div>

          <h1
            data-testid="hero-title"
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-none text-foreground mb-6"
          >
            {t("title")}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-xl mb-10">
            {t("subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={isLoggedIn ? "/dashboard" : "/sign-up"}
              className="h-14 px-8 bg-foreground text-background font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              {isLoggedIn ? tc("dashboard") : tc("startFreeTrial")}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              className="h-14 px-8 border border-border font-bold text-sm uppercase tracking-widest hover:bg-secondary transition-colors"
            >
              {tc("watchDemo")}
            </button>
          </div>
        </div>

        <div className="relative bg-secondary overflow-hidden border-t lg:border-t-0 border-border flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,var(--border)_25%,transparent_25%,transparent_75%,var(--border)_75%,var(--border)),linear-gradient(45deg,var(--border)_25%,transparent_25%,transparent_75%,var(--border)_75%,var(--border))] bg-[length:20px_20px] opacity-10" />

          <div className="relative w-full max-w-lg aspect-[4/3] bg-background border border-border shadow-2xl shadow-black/5">
            <div className="absolute top-0 left-0 right-0 h-8 border-b border-border flex items-center px-4 gap-2">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
              <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
              <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
            </div>
            <Image
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop"
              alt="Modern real estate property"
              fill
              className="object-cover pt-8"
              priority
            />

            <div className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 w-48 md:w-56 bg-background border border-border p-4 md:p-6 shadow-xl">
              <div className="mono-caption mb-2">{t("activeListings")}</div>
              <div className="text-3xl font-bold tracking-tighter">{stats.listingCount}</div>
              <div className="flex justify-between text-xs text-muted-foreground mt-3">
                <span>
                  {stats.tenantCount} {t("brokerages")}
                </span>
                <span>
                  {stats.userCount} {t("users")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustedBy({ t, clients }: { t: T; clients: string[] }) {
  if (clients.length === 0) return null;

  return (
    <section className="border-b border-border bg-background overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-48 py-6 md:py-8 border-b md:border-b-0 md:border-r border-border flex items-center justify-center text-xs font-bold uppercase tracking-widest bg-secondary/30">
          {t("trustedBy")}
        </div>
        <div className="flex-1 py-6 md:py-8 flex items-center justify-around gap-8 overflow-x-auto px-4">
          {clients.map((name) => (
            <div
              key={name}
              className="text-base md:text-lg font-bold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection({ t }: { t: T }) {
  const features = [
    { icon: Globe, titleKey: "multiTenant", descKey: "multiTenantDesc" },
    { icon: Layout, titleKey: "customBranding", descKey: "customBrandingDesc" },
    { icon: Lock, titleKey: "security", descKey: "securityDesc" },
  ];

  return (
    <section id="features" className="border-b border-border bg-background">
      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
        {features.map(({ icon: Icon, titleKey, descKey }) => (
          <div key={titleKey} className="p-8 md:p-12 group hover:bg-secondary/30 transition-colors">
            <div className="w-12 h-12 mb-6 flex items-center justify-center border border-border bg-background group-hover:border-foreground transition-colors">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-lg md:text-xl font-bold uppercase tracking-wide mb-4">
              {t(titleKey)}
            </h3>
            <p className="text-muted-foreground font-light leading-relaxed">{t(descKey)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function PerformanceSection({ t }: { t: T }) {
  return (
    <section className="border-b border-border bg-foreground text-background py-20 md:py-28 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-background/20 rounded-full mb-6">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">
                {t("performanceLabel")}
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter leading-none mb-6">
              {t("performance")}
            </h2>
            <p className="text-lg md:text-xl text-background/70 font-light leading-relaxed">
              {t("performanceDesc")}
            </p>
          </div>
          <div className="aspect-square border border-background/20 relative p-6 md:p-8">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:40px_40px]" />
            <div className="relative h-full border border-background/40 flex items-center justify-center">
              <div className="text-7xl md:text-8xl font-mono font-bold opacity-20">
                {t("uptimeValue")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SolutionsSection({ t }: { t: T }) {
  const solutions = [
    { titleKey: "forBrokerages", descKey: "forBrokeragesDesc" },
    { titleKey: "forTeams", descKey: "forTeamsDesc" },
    { titleKey: "forAgents", descKey: "forAgentsDesc" },
  ];

  return (
    <section id="solutions" className="border-b border-border bg-background">
      <div className="grid lg:grid-cols-2">
        <div className="p-8 md:p-16 lg:p-20 border-r border-border">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter mb-4">
            {t("solutionsTitle")}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground font-light">
            {t("solutionsSubtitle")}
          </p>
        </div>
        <div className="divide-y divide-border border-t lg:border-t-0">
          {solutions.map(({ titleKey, descKey }, i) => (
            <div
              key={titleKey}
              className="p-8 md:p-12 hover:bg-secondary/30 transition-colors group"
            >
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-base md:text-lg font-bold uppercase tracking-widest group-hover:text-primary transition-colors">
                  {t(titleKey)}
                </h3>
                <span className="mono-caption">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <p className="text-muted-foreground font-light">{t(descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection({ t, tc }: { t: T; tc: T }) {
  const plans = MARKETING_PLANS;

  return (
    <section id="pricing" className="py-20 md:py-28 bg-secondary/20 border-b border-border">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter mb-4">
            {t("pricingTitle")}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground font-light">
            {t("pricingSubtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.nameKey}
              className={`p-6 md:p-8 border flex flex-col ${
                plan.featured
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background border-border"
              }`}
            >
              <div className="mb-6">
                <h3
                  className={`text-xs font-bold uppercase tracking-widest mb-3 ${
                    plan.featured ? "text-background/70" : "text-muted-foreground"
                  }`}
                >
                  {t(plan.nameKey)}
                </h3>
                <div className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">
                  {t(plan.priceKey)}
                </div>
                <p
                  className={`text-sm ${
                    plan.featured ? "text-background/60" : "text-muted-foreground"
                  }`}
                >
                  {t(plan.descKey)}
                </p>
              </div>

              <div
                className={`flex-1 border-t pt-6 mb-6 ${
                  plan.featured ? "border-background/20" : "border-border"
                }`}
              >
                <ul className="space-y-3">
                  {plan.features.map((featureKey) => (
                    <li key={featureKey} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 opacity-50 flex-shrink-0" />
                      <span>{t(featureKey)}</span>
                    </li>
                  ))}
                </ul>
              </div>

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
  );
}

function Footer({ t, tc }: { t: T; tc: T }) {
  const footerGroups = [
    {
      titleKey: "product",
      items: [
        { key: "features", href: "/features" },
        { key: "pricing", href: "/pricing" },
        { key: "changelog", href: "/changelog" },
      ],
    },
    {
      titleKey: "company",
      items: [
        { key: "about", href: "/about" },
        { key: "careers", href: "/careers" },
        { key: "contact", href: "/contact" },
      ],
    },
    {
      titleKey: "legal",
      items: [
        { key: "privacy", href: "/privacy" },
        { key: "terms", href: "/terms" },
      ],
    },
  ];

  const socialLinks = ["twitter", "github", "linkedin"] as const;

  return (
    <footer className="relative z-10 bg-foreground text-background pt-16 md:pt-20 pb-8 md:pb-12">
      <div className="section-container">
        <div className="grid md:grid-cols-4 gap-10 mb-16">
          <div className="md:col-span-1">
            <Link href="/" className="block mb-6">
              <Logo inverted />
            </Link>
            <p className="text-sm text-background/70 leading-relaxed max-w-xs">
              {t("footerTagline")}
            </p>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerGroups.map((group) => (
              <div key={group.titleKey}>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-background">
                  {tc(group.titleKey)}
                </h4>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li key={item.key}>
                      <Link
                        href={item.href}
                        className="text-sm text-background/60 hover:text-background transition-colors"
                      >
                        {tc(item.key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-background/20 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-mono text-background/60">
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}. {tc("rightsReserved")}
          </p>
          <div className="flex gap-6">
            {socialLinks.map((social) => (
              <Link
                key={social}
                href="#"
                className="text-xs font-bold uppercase tracking-widest text-background/60 hover:text-background transition-colors"
              >
                {tc(social)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default async function HomePage() {
  const [t, tc, stats, clients, session] = await Promise.all([
    getTranslations("HomePage"),
    getTranslations("Common"),
    getPlatformStats(),
    getTrustedTenants(),
    getSession(),
  ]);

  const isLoggedIn = !!session;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 grid-pattern opacity-40" />
      </div>

      <Header tc={tc} isLoggedIn={isLoggedIn} />

      <main className="flex-1 relative z-10">
        <HeroSection t={t} tc={tc} stats={stats} isLoggedIn={isLoggedIn} />
        <TrustedBy t={t} clients={clients} />
        <FeaturesSection t={t} />
        <PerformanceSection t={t} />
        <SolutionsSection t={t} />
        <PricingSection t={t} tc={tc} />
      </main>

      <Footer t={t} tc={tc} />
    </div>
  );
}

import { ArrowRight, Check, Globe, Layout, Lock, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/Logo";
import { LanguageToggle } from "@/components/language-toggle";
import { ModeToggle } from "@/components/mode-toggle";

// --- Sub-components ---

const Header = () => {
  const tc = useTranslations("Common");
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center justify-center w-20 h-16 border-r border-border hover:bg-secondary transition-colors"
        >
          <Logo showText={false} />
        </Link>

        <nav className="hidden md:flex items-center flex-1 h-full">
          {["product", "solutions", "pricing"].map((key) => (
            <Link
              key={key}
              href={`#${key === "product" ? "features" : key}`}
              className="h-full flex items-center px-8 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground hover:bg-secondary border-r border-border transition-colors"
            >
              {tc(key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center h-full">
          <div className="hidden md:flex items-center h-full border-l border-border px-4 gap-2">
            <ModeToggle />
            <LanguageToggle />
          </div>
          <Link
            href="/sign-in"
            className="h-full flex items-center px-8 text-xs font-bold uppercase tracking-[0.15em] text-foreground hover:bg-secondary border-l border-border transition-colors"
          >
            {tc("login")}
          </Link>
          <Link
            href="/sign-up"
            className="h-full flex items-center px-8 bg-foreground text-background text-xs font-bold uppercase tracking-[0.15em] hover:bg-foreground/90 transition-colors"
          >
            {tc("getStarted")}
          </Link>
        </div>
      </div>
    </header>
  );
};

const HeroSection = () => {
  const t = useTranslations("HomePage");
  const tc = useTranslations("Common");
  return (
    <section className="relative border-b border-border">
      <div className="grid lg:grid-cols-2 min-h-[85vh]">
        {/* Left: Typography & Content */}
        <div className="flex flex-col justify-center p-12 lg:p-24 border-r border-border bg-background">
          <div className="inline-flex items-center gap-3 mb-12">
            <div className="w-2 h-2 bg-foreground animate-pulse"></div>
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              v2.0 {t("live")}
            </span>
          </div>

          <h1 className="text-6xl lg:text-8xl font-bold tracking-tighter leading-[0.9] text-foreground mb-8">
            {t("title")}
          </h1>

          <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-xl mb-12">
            {t("subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/sign-up"
              className="h-14 px-8 bg-foreground text-background font-bold text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              {tc("startFreeTrial")} <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              className="h-14 px-8 border border-border bg-transparent hover:bg-secondary text-foreground font-bold text-sm uppercase tracking-[0.15em] flex items-center justify-center transition-colors"
            >
              {tc("watchDemo")}
            </button>
          </div>
        </div>

        {/* Right: Visual */}
        <div className="relative bg-secondary overflow-hidden border-t lg:border-t-0 border-border flex items-center justify-center">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,var(--border)_25%,transparent_25%,transparent_75%,var(--border)_75%,var(--border)),linear-gradient(45deg,var(--border)_25%,transparent_25%,transparent_75%,var(--border)_75%,var(--border))] bg-[size:20px_20px] opacity-[0.1]"></div>

          {/* Dashboard Abstract Representation */}
          <div className="relative w-[80%] aspect-[4/3] bg-background border border-border shadow-2xl shadow-black/5 rotate-[-5deg] hover:rotate-0 transition-transform duration-700 ease-out">
            <div className="absolute top-0 left-0 right-0 h-8 border-b border-border flex items-center px-4 gap-2">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/20"></div>
              <div className="w-2 h-2 rounded-full bg-muted-foreground/20"></div>
              <div className="w-2 h-2 rounded-full bg-muted-foreground/20"></div>
            </div>
            <Image
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop"
              alt="Dashboard Preview"
              fill
              className="object-cover pt-8 grayscale contrast-125"
            />

            {/* Floating Data Cards */}
            <div className="absolute -bottom-12 -right-12 w-64 bg-background border border-border p-6 shadow-xl">
              <div className="text-xs font-mono text-muted-foreground mb-2">
                REVENUE_YTD
              </div>
              <div className="text-3xl font-bold tracking-tighter">€4.2M</div>
              <div className="w-full h-1 bg-secondary mt-4 overflow-hidden">
                <div className="h-full w-[70%] bg-foreground"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TrustedBy = () => {
  const t = useTranslations("HomePage");
  const clients = [
    "Acme Homes",
    "Vertex Estate",
    "Horizon Properties",
    "Oasis Living",
    "Urban Key",
  ];

  return (
    <section className="border-b border-border bg-background overflow-hidden">
      <div className="flex">
        <div className="w-48 py-8 border-r border-border flex items-center justify-center text-xs font-bold uppercase tracking-widest bg-secondary/30">
          {t("trustedBy")}
        </div>
        <div className="flex-1 py-8 flex items-center justify-around overflow-hidden whitespace-nowrap">
          {clients.map((name) => (
            <div
              key={name}
              className="text-lg font-bold text-muted-foreground/60 uppercase tracking-widest hover:text-foreground transition-colors cursor-default"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturesSection = () => {
  const t = useTranslations("HomePage");
  const features = [
    {
      icon: Globe,
      title: t("multiTenant"),
      desc: t("multiTenantDesc"),
    },
    {
      icon: Layout,
      title: t("customBranding"),
      desc: t("customBrandingDesc"),
    },
    {
      icon: Lock,
      title: t("security"),
      desc: t("securityDesc"),
    },
  ];

  return (
    <section id="features" className="border-b border-border bg-background">
      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="p-12 group hover:bg-secondary/30 transition-colors"
            >
              <div className="w-12 h-12 mb-8 flex items-center justify-center border border-border bg-background group-hover:border-foreground transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg md:text-xl font-bold uppercase tracking-wide mb-4 break-words hyphens-auto">
                {feature.title}
              </h3>
              <p className="text-muted-foreground font-light leading-relaxed">
                {feature.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const PerformanceSection = () => {
  const t = useTranslations("HomePage");
  return (
    <section className="border-b border-border bg-foreground text-background py-32 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-background/20 rounded-full mb-8">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Performance
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-8">
              {t("performance")}
            </h2>
            <p className="text-xl text-background/70 font-light leading-relaxed">
              {t("performanceDesc")}
            </p>
          </div>
          <div className="aspect-square border border-background/20 relative p-8">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            <div className="relative h-full border border-background/40 flex items-center justify-center">
              <div className="text-9xl font-mono font-bold opacity-20">
                99.9
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const SolutionsSection = () => {
  const t = useTranslations("HomePage");
  const solutions = [
    { title: t("forBrokerages"), desc: t("forBrokeragesDesc") },
    { title: t("forTeams"), desc: t("forTeamsDesc") },
    { title: t("forAgents"), desc: t("forAgentsDesc") },
  ];

  return (
    <section id="solutions" className="border-b border-border bg-background">
      <div className="grid lg:grid-cols-2">
        <div className="p-12 lg:p-24 border-r border-border">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
            {t("solutionsTitle")}
          </h2>
          <p className="text-xl text-muted-foreground font-light">
            {t("solutionsSubtitle")}
          </p>
        </div>
        <div className="divide-y divide-border border-t lg:border-t-0">
          {solutions.map((item, i) => (
            <div
              key={item.title}
              className="p-12 hover:bg-secondary/30 transition-colors group cursor-pointer"
            >
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="text-lg font-bold uppercase tracking-widest group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <span className="text-xs font-mono text-muted-foreground">
                  0{i + 1}
                </span>
              </div>
              <p className="text-muted-foreground font-light">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PricingSection = () => {
  const t = useTranslations("HomePage");
  const tc = useTranslations("Common");

  const plans = [
    { name: t("starter"), price: t("free"), desc: t("starterDesc") },
    {
      name: t("growth"),
      price: "€49",
      desc: t("growthDesc"),
      featured: true,
    },
    {
      name: t("enterprise"),
      price: t("custom"),
      desc: t("enterpriseDesc"),
    },
  ];

  return (
    <section
      id="pricing"
      className="py-32 bg-secondary/20 border-b border-border"
    >
      <div className="container mx-auto px-4 max-w-[90rem]">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
            {t("pricingTitle")}
          </h2>
          <p className="text-xl text-muted-foreground font-light">
            {t("pricingSubtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 border flex flex-col ${
                plan.featured
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background border-border"
              }`}
            >
              <div className="mb-8">
                <h3
                  className={`text-xs font-bold uppercase tracking-[0.2em] mb-4 break-words hyphens-auto ${
                    plan.featured
                      ? "text-background/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="text-5xl font-bold tracking-tighter mb-2">
                  {plan.price}
                </div>
                <p
                  className={`text-sm ${
                    plan.featured
                      ? "text-background/60"
                      : "text-muted-foreground"
                  }`}
                >
                  {plan.desc}
                </p>
              </div>

              <div
                className={`flex-1 border-t pt-8 mb-8 ${
                  plan.featured ? "border-background/20" : "border-border"
                }`}
              >
                <ul className="space-y-3">
                  {["f1", "f2", "f3"].map((key) => (
                    <li key={key} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 opacity-50" />
                      <span>Feature included</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                className={`w-full h-12 text-xs font-bold uppercase tracking-[0.15em] flex items-center justify-center transition-colors ${
                  plan.featured
                    ? "bg-background text-foreground hover:bg-background/90"
                    : "bg-foreground text-background hover:bg-foreground/90"
                }`}
              >
                {tc("getStarted")}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const t = useTranslations("HomePage");
  const tc = useTranslations("Common");
  return (
    <footer className="bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid md:grid-cols-4 gap-12 mb-24">
          <div className="md:col-span-1">
            <Link href="/" className="block mb-8">
              <Logo />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t("footerTagline")}
            </p>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                title: tc("product"),
                items: [tc("features"), tc("pricing"), tc("changelog")],
              },
              {
                title: tc("about"),
                items: [tc("about"), tc("careers"), tc("contact")],
              },
              { title: tc("privacy"), items: [tc("privacy"), tc("terms")] },
            ].map((group) => (
              <div key={group.title}>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-6">
                  {group.title}
                </h4>
                <ul className="space-y-4">
                  {group.items.map((item) => (
                    <li key={item}>
                      <Link
                        href="#"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-mono text-muted-foreground">
            &copy; {new Date().getFullYear()} Aether Inc. {tc("rightsReserved")}
          </p>
          <div className="flex gap-8">
            {[tc("twitter"), tc("github"), tc("linkedin")].map((social) => (
              <Link
                key={social}
                href="#"
                className="text-xs font-bold uppercase tracking-widest hover:text-muted-foreground transition-colors"
              >
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/10 selection:text-primary">
      {/* Structural Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:80px_80px] opacity-[0.4]"></div>
      </div>

      <Header />

      <main className="flex-1 relative z-10">
        <HeroSection />
        <TrustedBy />
        <FeaturesSection />
        <PerformanceSection />
        <SolutionsSection />
        <PricingSection />
        <Footer />
      </main>
    </div>
  );
}

import {
  ArrowRight,
  Check,
  ChevronRight,
  Globe,
  Layout,
  Lock,
  Play,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LanguageToggle } from "@/components/language-toggle";
import { ModeToggle } from "@/components/mode-toggle";
import { Logo } from "@/components/Logo";

export default function HomePage() {
  const t = useTranslations("HomePage");
  const tc = useTranslations("Common");

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/10 selection:text-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide uppercase text-muted-foreground">
            <Link
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              {tc("product")}
            </Link>
            <Link
              href="#solutions"
              className="hover:text-foreground transition-colors"
            >
              {tc("solutions")}
            </Link>
            <Link
              href="#pricing"
              className="hover:text-foreground transition-colors"
            >
              {tc("pricing")}
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1 mr-2 border-r border-border/40 pr-4">
              <ModeToggle />
              <LanguageToggle />
            </div>
            <Link
              href="/sign-in"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 uppercase tracking-wider"
            >
              {tc("login")}
            </Link>
            <Link
              href="/sign-up"
              className="hidden sm:inline-flex h-10 items-center justify-center bg-primary px-6 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              {tc("getStarted")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden bg-background">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.05]"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-muted border border-border/40 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <span className="flex h-1.5 w-1.5 bg-primary animate-pulse"></span>
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t("live")}
                </span>
              </div>

              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none text-foreground animate-in fade-in slide-in-from-bottom-8 duration-700 whitespace-pre-line">
                {t("title")}
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light animate-in fade-in slide-in-from-bottom-12 duration-900">
                {t("subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 animate-in fade-in slide-in-from-bottom-16 duration-1000">
                <Link
                  href="/sign-up"
                  className="h-12 px-8 bg-primary text-primary-foreground font-bold text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg"
                >
                  {tc("startFreeTrial")} <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  className="h-12 px-8 border border-border bg-background hover:bg-accent text-foreground font-bold text-sm uppercase tracking-widest flex items-center gap-2 transition-all"
                >
                  <Play className="w-4 h-4 fill-foreground" />
                  {tc("watchDemo")}
                </button>
              </div>
            </div>

            {/* Dashboard Mockup */}
            <div className="mt-24 relative max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-24 duration-1000 delay-200">
              <div className="border border-border bg-card p-2 shadow-2xl shadow-primary/5">
                <div className="overflow-hidden relative aspect-[16/9] bg-muted">
                  <Image
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop"
                    alt="Aether Dashboard"
                    fill
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-50 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By */}
        <section className="py-20 bg-background border-b border-border">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs font-bold text-muted-foreground mb-12 uppercase tracking-[0.3em]">
              {t("trustedBy")}
            </p>
            <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
              {[
                "Acme Homes",
                "Vertex Estate",
                "Horizon Properties",
                "Oasis Living",
                "Urban Key",
              ].map((name) => (
                <div
                  key={name}
                  className="flex items-center gap-2 text-2xl font-bold font-serif text-foreground"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-32 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-24">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tighter">
                {t("featuresTitle")}
              </h2>
              <p className="text-xl text-muted-foreground font-light">
                {t("featuresSubtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border overflow-hidden">
              {/* Feature 1 */}
              <div className="md:col-span-2 p-12 bg-card hover:bg-muted/30 transition-colors relative group">
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-primary/5 text-primary flex items-center justify-center mb-8">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    {t("multiTenant")}
                  </h3>
                  <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                    {t("multiTenantDesc")}
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-12 bg-card hover:bg-muted/30 transition-colors">
                <div className="w-12 h-12 bg-primary/5 text-primary flex items-center justify-center mb-8">
                  <Layout className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">
                  {t("customBranding")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("customBrandingDesc")}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-12 bg-card hover:bg-muted/30 transition-colors">
                <div className="w-12 h-12 bg-primary/5 text-primary flex items-center justify-center mb-8">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-foreground">
                  {t("security")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("securityDesc")}
                </p>
              </div>

              {/* Feature 4 */}
              <div className="md:col-span-2 p-12 bg-primary text-primary-foreground relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-primary-foreground/10 text-primary-foreground flex items-center justify-center mb-8">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    {t("performance")}
                  </h3>
                  <p className="text-lg text-primary-foreground/80 max-w-md leading-relaxed">
                    {t("performanceDesc")}
                  </p>
                </div>
                <div className="absolute inset-0 opacity-10 mix-blend-overlay group-hover:opacity-20 transition-opacity bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center" />
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section id="solutions" className="py-32 bg-background border-t border-border">
          <div className="container mx-auto px-4">
             <div className="text-center max-w-3xl mx-auto mb-24">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tighter">
                {t("solutionsTitle")}
              </h2>
              <p className="text-xl text-muted-foreground font-light">
                {t("solutionsSubtitle")}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { title: t("forBrokerages"), desc: t("forBrokeragesDesc") },
                  { title: t("forTeams"), desc: t("forTeamsDesc") },
                  { title: t("forAgents"), desc: t("forAgentsDesc") }
                ].map((item, i) => (
                  <div key={i} className="p-8 border border-border bg-card hover:border-primary/50 transition-colors group">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 bg-muted/30 border-t border-border">
          <div className="container mx-auto px-4">
             <div className="text-center max-w-3xl mx-auto mb-24">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tighter">
                {t("pricingTitle")}
              </h2>
              <p className="text-xl text-muted-foreground font-light">
                {t("pricingSubtitle")}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
               {[
                 { name: t("starter"), price: t("free"), desc: t("starterDesc") },
                 { name: t("growth"), price: "$49", desc: t("growthDesc") },
                 { name: t("enterprise"), price: t("custom"), desc: t("enterpriseDesc") }
               ].map((plan, i) => (
                 <div key={i} className="flex flex-col p-10 border border-border bg-card hover:shadow-2xl hover:shadow-primary/5 transition-all relative group">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">{plan.name}</h3>
                    <div className="text-5xl font-bold text-foreground mb-6 tracking-tight">{plan.price}</div>
                    <p className="text-muted-foreground mb-10 leading-relaxed">{plan.desc}</p>
                    <button type="button" className="mt-auto w-full h-12 border border-primary text-primary font-bold uppercase tracking-widest text-xs hover:bg-primary hover:text-primary-foreground transition-colors">
                      {tc("getStarted")}
                    </button>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 bg-foreground text-background border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-10">
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none">
                {t("ctaTitle")}
              </h2>
              <p className="text-2xl text-background/80 font-light max-w-2xl mx-auto">
                {t("ctaSubtitle")}
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                <Link
                  href="/sign-up"
                  className="h-14 px-10 bg-background text-foreground font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-background/90 transition-all"
                >
                  {tc("startFreeTrial")} <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/contact"
                  className="h-14 px-10 border border-background/20 text-background font-bold text-sm uppercase tracking-widest flex items-center justify-center hover:bg-background/10 transition-all"
                >
                  {tc("contactSales")}
                </Link>
              </div>

              <div className="pt-12 flex flex-wrap justify-center gap-8 text-xs font-bold uppercase tracking-widest text-background/60">
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" /> {t("noCreditCard")}
                </span>
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" /> {t("cancelAnytime")}
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background pt-24 pb-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-2 md:col-span-1 space-y-8">
              <div className="flex items-center gap-3">
                <Logo />
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                {t("footerTagline")}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-foreground mb-8">
                {tc("product")}
              </h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    {tc("features")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    {tc("pricing")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    {tc("changelog")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-foreground mb-8">
                {tc("about")}
              </h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    {tc("about")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    {tc("careers")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    {tc("contact")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-foreground mb-8">
                {tc("privacy")}
              </h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    {tc("privacy")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    {tc("terms")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} Aether Inc. {tc("rightsReserved")}
            </p>
            <div className="flex gap-8">
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                {tc("twitter")}
              </Link>
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                {tc("github")}
              </Link>
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                {tc("linkedin")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

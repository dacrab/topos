import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Logo } from "@/components/common/Logo";
import { LanguageToggle } from "@/components/common/language-toggle";
import { ModeToggle } from "@/components/common/mode-toggle";
import { TenantThemeProvider } from "@/components/common/TenantThemeProvider";
import { APP_CONFIG } from "@/lib/config";
import { getTenant } from "@/lib/getTenant";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const tenant = await getTenant(subdomain);
  if (!tenant) return {};
  return {
    title: `${tenant.name} - Exclusive Real Estate`,
    description: `Find your dream home with ${tenant.name}. Luxury properties across Greece.`,
    openGraph: {
      title: tenant.name,
      description: `Luxury properties by ${tenant.name}`,
      images: tenant.logoUrl ? [tenant.logoUrl] : [],
    },
  };
}

const NAV_LINKS = [
  { key: "properties", href: "/search" },
  { key: "agents", href: "/agents" },
  { key: "aboutUs", href: "/about" },
] as const;

const LEGAL_LINKS = [
  { key: "privacyPolicy", href: "#" },
  { key: "termsOfService", href: "#" },
  { key: "cookies", href: "#" },
] as const;

const SOCIAL_ICONS = [
  { icon: Facebook, href: "#" },
  { icon: Instagram, href: "#" },
  { icon: Twitter, href: "#" },
  { icon: Linkedin, href: "#" },
] as const;

export default async function SiteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const tenant = await getTenant(subdomain);
  const t = await getTranslations("Tenant");

  if (!tenant) return notFound();

  const TenantLogo = ({ size = 20 }: { size?: number }) =>
    tenant.logoUrl ? (
      <Image
        src={tenant.logoUrl}
        alt={tenant.name}
        width={size}
        height={size}
        className="object-contain"
        style={{ height: size, width: size }}
      />
    ) : (
      <Logo showText={false} className={size < 24 ? "scale-75 origin-left" : ""} />
    );

  return (
    <TenantThemeProvider branding={tenant.branding}>
      <div className="flex min-h-screen flex-col bg-background font-sans antialiased text-foreground selection:bg-primary/10">
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-20 items-center justify-between px-8 max-w-screen-2xl">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="hidden sm:flex flex-col leading-none">
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                  <TenantLogo />
                  {tenant.name}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground mt-1 tracking-widest">
                  {t("exclusiveRealEstate")}
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-12 text-xs font-medium tracking-widest uppercase text-muted-foreground">
              {NAV_LINKS.map(({ key, href }) => (
                <Link key={key} href={href} className="hover:text-foreground transition-colors">
                  {t(key)}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-2 pr-6 mr-2 border-r border-border/60">
                <ModeToggle />
                <LanguageToggle />
              </div>
              <Link
                href="/contact"
                className="inline-flex h-10 items-center justify-center bg-primary px-6 text-xs font-medium tracking-widest uppercase text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                {t("contactUs")}
              </Link>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center border border-border/60 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden transition-colors"
                aria-label={t("openNavMenu")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                >
                  <title>{t("openNavMenu")}</title>
                  <line x1="3" x2="21" y1="6" y2="6" />
                  <line x1="3" x2="21" y1="12" y2="12" />
                  <line x1="3" x2="21" y1="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="bg-muted/20 border-t border-border/60 pt-24 pb-12">
          <div className="container mx-auto px-8 max-w-screen-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
              <div className="space-y-6">
                <div className="text-2xl font-bold tracking-tighter text-foreground flex items-center gap-2">
                  <TenantLogo size={24} />
                  {tenant.name}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  {t("footerDesc")}
                </p>
              </div>

              <FooterNav
                title={t("navigation")}
                links={NAV_LINKS.map((l) => ({ ...l, label: t(l.key) }))}
              />
              <FooterNav
                title={t("legal")}
                links={LEGAL_LINKS.map((l) => ({ ...l, label: t(l.key) }))}
              />

              <div>
                <h4 className="font-bold text-xs uppercase tracking-widest mb-8 text-foreground">
                  {t("followUs")}
                </h4>
                <div className="flex gap-4">
                  {SOCIAL_ICONS.map(({ icon: Icon, href }) => (
                    <Link
                      key={Icon.displayName}
                      href={href}
                      className="w-10 h-10 bg-background border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-all"
                    >
                      <Icon size={16} strokeWidth={1.5} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-border/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-muted-foreground tracking-wide uppercase">
              <p>
                &copy; {new Date().getFullYear()} {tenant.name}. {t("allRightsReserved")}
              </p>
              <p>
                {t("poweredBy")}{" "}
                <span className="font-bold text-foreground">{APP_CONFIG.name.toUpperCase()}</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </TenantThemeProvider>
  );
}

function FooterNav({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="font-bold text-xs uppercase tracking-widest mb-8 text-foreground">{title}</h4>
      <ul className="space-y-4 text-sm text-muted-foreground">
        {links.map(({ href, label }) => (
          <li key={label}>
            <Link href={href} className="hover:text-foreground transition-colors">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

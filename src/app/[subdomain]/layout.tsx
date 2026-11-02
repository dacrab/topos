import { Compass } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Logo } from "@/components/common/Logo";
import { ThemeControls } from "@/components/ui/mode-toggle";
import { APP_CONFIG } from "@/lib/config";
import { getTenant } from "@/lib/getTenant";
import { tenantThemeCss } from "@/lib/tenant-theme";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}): Promise<Metadata> {
  const { subdomain } = await params;
  const tenant = await getTenant(subdomain);
  if (!tenant) return {};
  const t = await getTranslations("PublicSite");
  return {
    title: t("metaTitle", { name: tenant.name }),
    description: t("metaDescription", { name: tenant.name }),
  };
}

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

  const nav = [
    { href: `/${subdomain}`, label: t("properties"), index: "01" },
    { href: `/${subdomain}/agents`, label: t("agents"), index: "02" },
  ];

  return (
    <div className="tenant-theme flex min-h-screen flex-col bg-background text-foreground">
      {/* Tenant colors are validated as strict hex/length values before they reach this tag. */}
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: values are validated hex colors and CSS lengths */}
      <style dangerouslySetInnerHTML={{ __html: tenantThemeCss(tenant.branding) }} />

      <header className="sticky top-0 z-50 border-b border-foreground/20 bg-background/95 backdrop-blur-md">
        <div className="shell-wide flex h-16 items-center justify-between gap-6">
          <Link
            href={`/${subdomain}`}
            className="group flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80"
          >
            {tenant.logoUrl ? (
              <Image
                src={tenant.logoUrl}
                alt={tenant.name}
                width={30}
                height={30}
                className="h-8 w-8 border border-border object-contain"
              />
            ) : (
              <Logo showText={false} compact />
            )}
            <span className="truncate font-display text-lg tracking-[-0.02em] transition-colors group-hover:text-accent">
              {tenant.name}
            </span>
          </Link>

          <nav className="hidden items-stretch self-stretch md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-2 border-l border-border px-5 meta-caps text-muted-foreground transition-colors first:border-l-0 hover:text-foreground"
              >
                <span className="text-[0.5625rem] text-muted-foreground/60 group-hover:text-accent">
                  {item.index}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeControls className="hidden h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground sm:flex" />
            <Link href={`/${subdomain}/contact`} className="btn-primary btn-sm">
              {t("contactUs")}
            </Link>
          </div>
        </div>

        <nav className="shell-wide flex items-center gap-6 border-t border-border py-2.5 meta-caps text-muted-foreground md:hidden">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t-2 border-foreground/85">
        <div className="shell-wide">
          <div className="grid gap-10 border-b border-border py-14 md:grid-cols-[1.5fr_1fr] md:gap-16">
            <div className="flex flex-col justify-between gap-8">
              <div className="max-w-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  {tenant.logoUrl ? (
                    <Image
                      src={tenant.logoUrl}
                      alt={tenant.name}
                      width={24}
                      height={24}
                      className="h-6 w-6 border border-border object-contain"
                    />
                  ) : (
                    <Logo compact showText={false} />
                  )}
                  <span className="font-display text-lg tracking-[-0.02em]">{tenant.name}</span>
                </div>
                {tenant.branding?.description && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {tenant.branding.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 meta-caps text-muted-foreground">
                <Compass className="h-3.5 w-3.5 text-accent" />
                <span>{t("properties")}</span>
              </div>
            </div>

            <nav className="flex flex-col items-start gap-3 border-t border-border pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 meta-caps text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="text-accent">{item.index}</span>
                  {item.label}
                </Link>
              ))}
              <Link
                href={`/${subdomain}/contact`}
                className="flex items-center gap-3 meta-caps text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="text-accent">03</span>
                {t("contactUs")}
              </Link>
            </nav>
          </div>

          <div className="flex flex-col justify-between gap-2 py-5 meta-caps text-muted-foreground sm:flex-row sm:items-center">
            <p>
              &copy; {new Date().getFullYear()} {tenant.name} — {t("allRightsReserved")}
            </p>
            <p>
              {t("poweredBy")}{" "}
              <Link href="/" className="text-foreground transition-colors hover:text-accent">
                {APP_CONFIG.name}
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

import { Compass } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Logo } from "@/components/common/Logo";
import { ThemeControls } from "@/components/ui/mode-toggle";
import { APP_CONFIG } from "@/lib/config";
import { getTenant } from "@/lib/getTenant";
import { SiteContent } from "./TenantThemeProvider";

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

  return (
    <SiteContent branding={tenant.branding ?? null}>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex h-16 items-center justify-between px-6 md:px-8 max-w-7xl">
            <Link
              href={`/${subdomain}`}
              className="flex items-center gap-3 group hover:opacity-80 transition-opacity"
            >
              {tenant.logoUrl ? (
                <Image
                  src={tenant.logoUrl}
                  alt={tenant.name}
                  width={24}
                  height={24}
                  className="object-contain rounded-full"
                />
              ) : (
                <Logo showText={false} compact />
              )}
              <span className="font-display font-semibold text-base tracking-tight group-hover:text-primary transition-colors">
                {tenant.name}
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
              <Link
                href={`/${subdomain}`}
                className="hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
              >
                {t("properties")}
              </Link>
              <Link
                href={`/${subdomain}/agents`}
                className="hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
              >
                {t("agents")}
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <ThemeControls className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary/60 transition-colors" />
              <Link href={`/${subdomain}/contact`} className="btn-primary btn-sm">
                {t("contactUs")}
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-border py-14">
          <div className="shell-wide flex flex-col items-center gap-8">
            <div className="flex items-center gap-2 text-muted-foreground/40">
              <span className="w-8 h-px bg-border" />
              <Compass className="w-3.5 h-3.5" />
              <span className="w-8 h-px bg-border" />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 w-full text-xs text-muted-foreground">
              <p>
                &copy; {new Date().getFullYear()} {tenant.name}. {t("allRightsReserved")}
              </p>
              <nav className="flex items-center gap-8">
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  {t("privacyPolicy")}
                </Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  {t("termsOfService")}
                </Link>
              </nav>
              <p>
                {t("poweredBy")}{" "}
                <span className="font-semibold text-foreground">{APP_CONFIG.name}</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </SiteContent>
  );
}

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
import type { TenantBranding } from "@/lib/types";
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
    <SiteContent branding={tenant.branding as TenantBranding | null}>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        {/* ── Header ── */}
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex h-16 items-center justify-between px-8 max-w-screen-xl">
            <Link
              href="/"
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
                href="/"
                className="hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
              >
                {t("properties")}
              </Link>
              <Link
                href="/agents"
                className="hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
              >
                {t("agents")}
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <ThemeControls className="hidden sm:flex" />
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-primary text-primary-foreground px-5 py-2 text-sm font-medium rounded-full hover:bg-primary/90 transition-all shadow-card hover:shadow-card-hover active:scale-[0.97]"
              >
                {t("contactUs")}
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        {/* ── Footer ── */}
        <footer className="border-t border-border/40 py-16">
          <div className="mx-auto px-8 max-w-screen-xl flex flex-col items-center gap-8 text-xs text-muted-foreground">
            {/* Decorative */}
            <div className="flex items-center gap-2">
              <span className="w-6 h-px bg-border" />
              <Compass className="w-3 h-3 text-muted-foreground/30" />
              <span className="w-6 h-px bg-border" />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 w-full">
              <p className="text-xs">
                &copy; {new Date().getFullYear()} {tenant.name}. {t("allRightsReserved")}
              </p>
              <nav className="flex items-center gap-8">
                <Link href="/about" className="hover:text-foreground transition-colors">
                  {t("aboutUs")}
                </Link>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  {t("privacyPolicy")}
                </Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  {t("termsOfService")}
                </Link>
              </nav>
              <p className="text-xs">
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

import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Logo } from "@/components/common/Logo";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { ThemeControls } from "@/components/ui/mode-toggle";
import { APP_CONFIG } from "@/lib/config";

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations("Common");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="site-header">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 px-6 h-full">
            <Logo showText={false} />
            <span className="font-semibold tracking-tight text-lg hidden sm:block">
              {APP_CONFIG.name}
            </span>
          </Link>
          <div className="flex items-center h-full">
            <LocaleSwitcher className="h-full flex items-center px-4 border-l border-border hover:bg-accent transition-colors" />
            <ThemeControls className="h-full flex items-center px-4 border-l border-border hover:bg-accent transition-colors" />
            <Link href="/sign-in" className="nav-ghost hidden sm:flex">
              {t("login")}
            </Link>
            <Link href="/sign-up" className="nav-cta">
              {t("getStarted")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-foreground text-background">
        <div className="section-container py-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo inverted />
          <nav className="flex gap-6 text-sm text-background/50">
            <Link href="/privacy" className="hover:text-background transition-colors">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="hover:text-background transition-colors">
              {t("terms")}
            </Link>
          </nav>
          <p className="text-sm text-background/40">
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}
          </p>
        </div>
      </footer>
    </div>
  );
}

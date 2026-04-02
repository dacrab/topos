import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Logo } from "@/components/common/Logo";
import { ThemeLocaleControls } from "@/components/ui/language-toggle";
import { APP_CONFIG } from "@/lib/config";

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations("Common");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 grid-pattern opacity-40" />
      </div>

      <header className="site-header">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center justify-center w-20 h-16 border-r border-border hover:bg-secondary transition-colors"
          >
            <Logo showText={false} />
          </Link>

          <nav className="hidden md:flex items-center flex-1 h-full">
            <Link href="/#features" className="nav-link">
              {t("product")}
            </Link>
            <Link href="/#solutions" className="nav-link">
              {t("solutions")}
            </Link>
            <Link href="/pricing" className="nav-link">
              {t("pricing")}
            </Link>
          </nav>

          <div className="flex items-center h-full">
            <ThemeLocaleControls className="hidden md:flex h-full border-l border-border px-4" />
            <Link href="/sign-in" className="nav-ghost">
              {t("login")}
            </Link>
            <Link href="/sign-up" className="nav-cta">
              {t("getStarted")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">{children}</main>

      <footer className="relative z-10 bg-foreground text-background py-8 border-t border-border">
        <div className="section-container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Link href="/">
              <Logo inverted />
            </Link>
            <p className="text-xs font-mono text-background/60">
              &copy; {new Date().getFullYear()} {APP_CONFIG.name}. {t("rightsReserved")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

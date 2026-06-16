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
        <div className="flex h-14 items-center justify-between max-w-6xl mx-auto px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo showText={false} />
            <span className="font-bold tracking-tight text-lg hidden sm:block">
              {APP_CONFIG.name}
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <LocaleSwitcher className="h-8 px-3 flex items-center rounded-lg hover:bg-secondary transition-colors text-sm" />
            <ThemeControls className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors" />
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex items-center px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("login")}
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t("getStarted")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/40">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo />
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              {t("terms")}
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground/60">
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}
          </p>
        </div>
      </footer>
    </div>
  );
}

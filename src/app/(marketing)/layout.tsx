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
        <div className="flex h-16 items-center justify-between shell">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo showText={false} />
            <span className="font-display font-medium tracking-tight text-lg hidden sm:block group-hover:text-primary transition-colors">
              {APP_CONFIG.name}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <LocaleSwitcher className="h-9 px-3 flex items-center rounded-lg hover:bg-secondary/60 transition-colors text-sm" />
            <ThemeControls className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-secondary/60 transition-colors" />
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              {t("login")}
            </Link>
            <Link href="/sign-up" className="btn-primary btn-sm">
              {t("getStarted")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border">
        <div className="shell py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <Logo serif showText={false} />
              <span className="font-display font-medium tracking-tight">{APP_CONFIG.name}</span>
            </Link>

            <nav className="flex gap-6 items-baseline">
              <Link
                href="/pricing"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("pricing")}
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("privacy")}
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("terms")}
              </Link>
            </nav>

            <p className="mono-caption text-micro tracking-caps">τόπος · a sense of place</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

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
        <div className="flex h-16 items-center justify-between max-w-6xl mx-auto px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo showText={false} />
            <span className="font-display font-semibold tracking-tight text-lg hidden sm:block group-hover:text-primary transition-colors">
              {APP_CONFIG.name}
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <LocaleSwitcher className="h-8 px-3 flex items-center rounded-full hover:bg-accent/10 transition-colors text-sm" />
            <ThemeControls className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-accent/10 transition-colors" />
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex items-center px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-accent/10"
            >
              {t("login")}
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground px-5 py-1.5 text-sm font-medium rounded-full hover:bg-primary/90 shadow-card card-hover hover:shadow-card-hover active-scale"
            >
              {t("getStarted")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/40 bg-gradient-to-b from-transparent to-muted/20">
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col items-center gap-6">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo serif />
          </Link>
          <p className="text-xs text-muted-foreground/60 font-mono tracking-wide-caps">
            τόπος · a sense of place
          </p>
          <div className="my-4 w-full max-w-sm mx-auto">
            <span className="text-micro font-mono text-muted-foreground/30">◈</span>
          </div>
          <nav className="flex gap-8 text-sm">
            <Link
              href="/pricing"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("pricing")}
            </Link>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("privacy")}
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("terms")}
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground/40">
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}
          </p>
        </div>
      </footer>
    </div>
  );
}

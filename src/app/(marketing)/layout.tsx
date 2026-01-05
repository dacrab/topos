import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/common/Logo";
import { LanguageToggle } from "@/components/common/language-toggle";
import { ModeToggle } from "@/components/common/mode-toggle";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("Common");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[length:80px_80px] opacity-40" />
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-sm">
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
            <div className="hidden md:flex items-center h-full border-l border-border px-4 gap-2">
              <ModeToggle />
              <LanguageToggle />
            </div>
            <Link
              href="/sign-in"
              className="h-full flex items-center px-8 text-xs font-bold uppercase tracking-widest text-foreground hover:bg-secondary border-l border-border transition-colors"
            >
              {t("login")}
            </Link>
            <Link
              href="/sign-up"
              className="h-full flex items-center px-8 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:bg-foreground/90 transition-colors"
            >
              {t("getStarted")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">{children}</main>

      <footer className="relative z-10 bg-foreground text-background py-8 border-t border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Link href="/">
              <Logo inverted />
            </Link>
            <p className="text-xs font-mono text-background/60">
              &copy; {new Date().getFullYear()} Aether. {t("rightsReserved")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

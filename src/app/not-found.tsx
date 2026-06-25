import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/common/Logo";

export default async function NotFound() {
  const t = await getTranslations("Common");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-14 flex items-center px-6 border-b border-border/40">
        <Link href="/">
          <Logo />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern-dot opacity-30 pointer-events-none" />
        <div className="max-w-md text-center space-y-6 relative z-10">
          <div className="inline-flex items-center bg-primary/10 border border-primary/20 px-4 py-2 rounded-full">
            <span className="font-mono text-xs text-primary font-medium">
              {t("errorNotFoundCode")}
            </span>
          </div>
          <h1 className="font-display text-7xl font-semibold tracking-tight">404</h1>
          <p className="text-muted-foreground">{t("errorNotFoundDesc")}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 text-sm font-medium rounded-full hover:bg-primary/90 transition-colors shadow-card"
          >
            {t("errorGoHome")}
          </Link>
        </div>
      </main>
    </div>
  );
}

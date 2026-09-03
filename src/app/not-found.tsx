import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/common/Logo";

export default async function NotFound() {
  const t = await getTranslations("Common");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Logo />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 texture-grid opacity-30 pointer-events-none" />
        <div className="max-w-md text-center space-y-6 relative z-10">
          <div className="code-pill">
            <span className="mono-caption text-xs font-medium">{t("errorNotFoundCode")}</span>
          </div>
          <h1 className="font-display text-7xl font-semibold tracking-tight text-foreground">
            404
          </h1>
          <p className="text-muted-foreground">{t("errorNotFoundDesc")}</p>
          <div className="flex justify-center pt-2">
            <Link href="/" className="btn-primary btn-md">
              {t("errorGoHome")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

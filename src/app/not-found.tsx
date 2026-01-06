import { ArrowLeft, Home, Search } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("Errors");
  const tc = await getTranslations("Common");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[length:40px_40px]" />

      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        <div className="space-y-2">
          <div className="text-[120px] sm:text-[180px] font-mono font-bold leading-none tracking-tighter text-foreground/10">
            404
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground -mt-8">
            {t("notFoundTitle")}
          </div>
        </div>

        <div className="space-y-4 border-t border-b border-border py-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t("notFoundHeading")}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">{t("notFoundDesc")}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 bg-foreground text-background px-6 py-3 font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity"
          >
            <Home className="w-4 h-4" />
            {t("goHome")}
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 border border-border px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-secondary transition-colors text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            {tc("dashboard")}
          </Link>
        </div>

        <div className="pt-8 border-t border-border">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Search className="w-3 h-3" />
              <span className="font-mono">{t("errorCode")}: NOT_FOUND</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

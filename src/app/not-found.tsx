import { Compass } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/common/Logo";

export default async function NotFound() {
  const t = await getTranslations("Common");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 flex items-center px-6 border-b border-border/40">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Logo />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern-dot opacity-20 pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-primary/[0.03] blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-accent/[0.03] blur-3xl pointer-events-none" />

        <div className="max-w-md text-center space-y-6 relative z-10">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Compass className="w-7 h-7 text-primary" />
            </div>
          </div>
          <div className="inline-flex items-center border border-primary/20 bg-primary/[0.04] px-4 py-2 rounded-full">
            <span className="font-mono text-xs text-primary font-medium tracking-wider">
              {t("errorNotFoundCode")}
            </span>
          </div>
          <h1 className="font-display text-7xl font-semibold tracking-tight text-foreground">
            404
          </h1>
          <p className="text-muted-foreground">{t("errorNotFoundDesc")}</p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-foreground text-background px-6 py-3 text-sm font-medium rounded-full hover:bg-foreground/90 transition-all shadow-card card-hover hover:shadow-card-hover active:scale-[0.97]"
            >
              {t("errorGoHome")}
            </Link>
          </div>
          <div className="pt-6 max-w-[160px] mx-auto" />
        </div>
      </main>
    </div>
  );
}

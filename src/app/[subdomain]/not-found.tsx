import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("Tenant");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-8">
      <div className="texture-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative z-10 grid w-full max-w-3xl gap-6 border-t-2 border-foreground/85 pt-8 sm:grid-cols-[auto_1fr] sm:gap-10">
        <h1 className="font-display text-[7rem] leading-[0.8] tracking-[-0.06em] text-accent sm:text-[9rem]">
          404
        </h1>
        <div className="sm:border-l sm:border-border sm:pl-10">
          <p className="meta-caps text-muted-foreground">{t("siteNotFoundCode")}</p>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
            {t("siteNotFoundDesc")}
          </p>
          <Link href="/" className="btn-primary btn-md mt-7">
            <ArrowLeft className="h-4 w-4" />
            {t("goToToposHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}

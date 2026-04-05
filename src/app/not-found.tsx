import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("Common");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
      <p className="text-8xl font-mono font-bold text-foreground/10 mb-4">404</p>
      <h1 className="text-2xl font-bold tracking-tight mb-2">{t("errorNotFoundHeading")}</h1>
      <p className="text-muted-foreground mb-8">{t("errorNotFoundDesc")}</p>
      <Link
        href="/"
        className="bg-foreground text-background px-6 py-3 font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity"
      >
        {t("errorGoHome")}
      </Link>
    </div>
  );
}

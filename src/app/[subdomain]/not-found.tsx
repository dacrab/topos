import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("Tenant");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="inline-block border border-border rounded-md px-4 py-2">
          <span className="font-mono text-xs text-muted-foreground">{t("siteNotFoundCode")}</span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight">404</h1>
        <p className="text-muted-foreground">{t("siteNotFoundDesc")}</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          {t("goToToposHome")}
        </Link>
      </div>
    </div>
  );
}

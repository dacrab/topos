import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("Tenant");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="code-pill">
          <span className="mono-caption text-xs">{t("siteNotFoundCode")}</span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight">404</h1>
        <p className="text-muted-foreground">{t("siteNotFoundDesc")}</p>
        <Link href="/" className="btn-primary btn-md">
          {t("goToToposHome")}
        </Link>
      </div>
    </div>
  );
}

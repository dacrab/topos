import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("Tenant");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="inline-block border-2 border-foreground px-4 py-2">
          <span className="font-mono text-xs font-bold tracking-widest text-muted-foreground">
            {t("siteNotFoundCode")}
          </span>
        </div>
        <h1 className="text-5xl font-bold tracking-tighter">404</h1>
        <p className="text-muted-foreground">{t("siteNotFoundDesc")}</p>
        <Link href="/" className="btn-primary inline-flex px-6 py-3">
          {t("goToToposHome")}
        </Link>
      </div>
    </div>
  );
}

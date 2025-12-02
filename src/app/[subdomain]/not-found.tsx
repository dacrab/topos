import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("Tenant");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">{t("siteNotFound")}</h1>
      <p className="text-muted-foreground mb-8">{t("siteNotFoundDesc")}</p>
      <Link href="/" className="text-primary hover:underline">
        {t("goToAetherHome")}
      </Link>
    </div>
  );
}

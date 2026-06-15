import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/common/Logo";

export default async function NotFound() {
  const t = await getTranslations("Common");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-14 flex items-center px-6 border-b border-border">
        <Link href="/">
          <Logo />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-6">
          <div className="inline-block border border-border rounded-md px-4 py-2">
            <span className="font-mono text-xs text-muted-foreground">
              {t("errorNotFoundCode")}
            </span>
          </div>
          <h1 className="text-6xl font-bold tracking-tight">404</h1>
          <p className="text-muted-foreground">{t("errorNotFoundDesc")}</p>
          <Link href="/" className="btn-primary inline-flex px-6 py-3">
            {t("errorGoHome")}
          </Link>
        </div>
      </main>
    </div>
  );
}

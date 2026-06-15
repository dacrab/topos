"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Common");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="max-w-md space-y-6">
        <div className="inline-block border border-destructive/30 bg-destructive/5 rounded-md px-4 py-2">
          <span className="font-mono text-xs font-medium text-destructive">
            {t("errorId")}: {error.digest ?? "UNKNOWN"}
          </span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">{t("somethingWentWrong")}</h1>
        <p className="text-muted-foreground">{t("errorOccurred")}</p>
        <div className="flex gap-3 justify-center">
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center border border-border bg-background px-5 py-2.5 text-sm font-medium rounded-md shadow-sm hover:bg-accent transition-colors"
          >
            {t("goToDashboard")}
          </a>
          <Button type="button" variant="primary" onClick={reset}>
            {t("tryAgain")}
          </Button>
        </div>
      </div>
    </div>
  );
}

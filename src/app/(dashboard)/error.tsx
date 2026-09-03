"use client";

import { AlertTriangle } from "lucide-react";
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
        <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <h1 className="page-title text-foreground">{t("somethingWentWrong")}</h1>
          <p className="text-muted-foreground mt-2">{t("errorOccurred")}</p>
        </div>
        <p className="code-pill mono-caption">
          {t("errorId")}: {error.digest ?? "UNKNOWN"}
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <a href="/dashboard" className="btn-outline btn-md">
            {t("goToDashboard")}
          </a>
          <Button type="button" variant="default" onClick={reset}>
            {t("tryAgain")}
          </Button>
        </div>
      </div>
    </div>
  );
}

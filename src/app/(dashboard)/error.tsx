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
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg border-t-2 border-foreground/85 pt-8">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-destructive text-destructive">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div>
            <h1 className="card-title text-foreground">{t("somethingWentWrong")}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("errorOccurred")}
            </p>
          </div>
        </div>

        <p className="mt-6 border-l-2 border-border pl-3 meta-caps text-muted-foreground">
          {t("errorId")}: {error.digest ?? "UNKNOWN"}
        </p>

        <div className="mt-7 flex gap-2">
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

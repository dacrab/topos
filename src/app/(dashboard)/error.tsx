"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type ErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const t = useTranslations("Common");
  const router = useRouter();

  useEffect(() => {
    // biome-ignore lint/suspicious/noConsole: error boundary logging
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-16 h-16 mx-auto border-2 border-destructive/20 flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight">{t("somethingWentWrong")}</h2>
        <p className="text-muted-foreground text-sm">{t("errorOccurred")}</p>
        {error.digest && (
          <p className="text-xs font-mono text-muted-foreground">
            {t("errorId")}: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center pt-4">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            {t("goToDashboard")}
          </Button>
          <Button onClick={reset}>{t("tryAgain")}</Button>
        </div>
      </div>
    </div>
  );
}

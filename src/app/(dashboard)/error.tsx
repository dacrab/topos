"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Common");
  const router = useRouter();

  useEffect(() => {
    // error is already captured by Next.js error boundary internals
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <h2 className="text-xl font-bold tracking-tight mb-2">{t("somethingWentWrong")}</h2>
      <p className="text-muted-foreground text-sm mb-2">{t("errorOccurred")}</p>
      {error.digest && (
        <p className="mono-caption mb-6">
          {t("errorId")}: {error.digest}
        </p>
      )}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          {t("goToDashboard")}
        </Button>
        <Button onClick={reset}>{t("tryAgain")}</Button>
      </div>
    </div>
  );
}

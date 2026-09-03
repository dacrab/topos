"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
};

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  const t = useTranslations("Common");
  const searchParams = useSearchParams();
  if (totalPages <= 1) return null;

  const href = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const navBtn =
    "inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-border rounded-lg bg-card shadow-card hover:bg-secondary/60 transition-colors disabled:opacity-40 disabled:pointer-events-none";

  return (
    <nav className="flex items-center justify-center gap-3 pt-4" aria-label="Pagination">
      {currentPage > 1 ? (
        <Link href={href(currentPage - 1)} className={navBtn}>
          <ChevronLeft className="h-4 w-4" />
          {t("previous")}
        </Link>
      ) : (
        <span className={navBtn} aria-disabled="true">
          <ChevronLeft className="h-4 w-4" />
          {t("previous")}
        </span>
      )}

      <span className="text-sm text-muted-foreground px-2 tabular-nums">
        {t("pageOf", { current: currentPage, total: totalPages })}
      </span>

      {currentPage < totalPages ? (
        <Link href={href(currentPage + 1)} className={navBtn}>
          {t("next")}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={navBtn} aria-disabled="true">
          {t("next")}
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}

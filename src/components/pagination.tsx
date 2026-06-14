"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath: string;
};

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  const t = useTranslations("Common");
  if (totalPages <= 1) return null;

  const href = (page: number) => `${basePath}?page=${page}`;

  return (
    <nav className="flex items-center justify-center gap-2 pt-4">
      {currentPage > 1 ? (
        <Link
          href={href(currentPage - 1)}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm border-2 border-foreground hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("previous")}
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 px-3 py-2 text-sm border-2 border-foreground opacity-50 cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
          {t("previous")}
        </span>
      )}

      <span className="text-sm text-muted-foreground px-2">
        {t("pageOf", { current: currentPage, total: totalPages })}
      </span>

      {currentPage < totalPages ? (
        <Link
          href={href(currentPage + 1)}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm border-2 border-foreground hover:bg-muted transition-colors"
        >
          {t("next")}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 px-3 py-2 text-sm border-2 border-foreground opacity-50 cursor-not-allowed">
          {t("next")}
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}

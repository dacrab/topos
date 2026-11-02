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
    "inline-flex items-center gap-1 border border-border bg-transparent px-3 py-1.5 meta-caps transition-colors hover:border-foreground hover:bg-foreground hover:text-background disabled:opacity-40 disabled:pointer-events-none";

  return (
    <nav
      className="flex items-center justify-between gap-3 border-t border-border pt-4"
      aria-label={t("pagination")}
    >
      {currentPage > 1 ? (
        <Link href={href(currentPage - 1)} className={navBtn}>
          <ChevronLeft className="h-3.5 w-3.5" />
          {t("previous")}
        </Link>
      ) : (
        <span className={navBtn} aria-disabled="true">
          <ChevronLeft className="h-3.5 w-3.5" />
          {t("previous")}
        </span>
      )}

      <span className="meta-caps text-muted-foreground tabular-nums">
        {t("pageOf", { current: currentPage, total: totalPages })}
      </span>

      {currentPage < totalPages ? (
        <Link href={href(currentPage + 1)} className={navBtn}>
          {t("next")}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <span className={navBtn} aria-disabled="true">
          {t("next")}
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      )}
    </nav>
  );
}

import { count, desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Pagination } from "@/components/pagination";
import { EmptyState, SectionHeader } from "@/components/ui/page";
import { auditLog } from "@/db/schema";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireDashboardAuth } from "@/lib/page-helpers";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Activity");
  return { title: t("title") };
}

const PAGE_SIZE = 20;

const ACTION_ICONS: Record<string, string> = {
  CREATE: "\u2795",
  UPDATE: "\u270F\uFE0F",
  DELETE: "\uD83D\uDDD1\uFE0F",
  NOTE: "\uD83D\uDCDD",
};

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const t = await getTranslations("Activity");
  const { tenantId } = await requireDashboardAuth();
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [entries, [totalRow]] = await Promise.all([
    db
      .select()
      .from(auditLog)
      .where(eq(auditLog.tenantId, tenantId))
      .orderBy(desc(auditLog.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ count: count() }).from(auditLog).where(eq(auditLog.tenantId, tenantId)),
  ]);

  const totalPages = Math.ceil((totalRow?.count ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <SectionHeader title={t("title")} description={t("subtitle")} />

      {entries.length === 0 && currentPage === 1 ? (
        <EmptyState>{t("noActivity")}</EmptyState>
      ) : (
        <>
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 rounded-xl border border-border/60 p-4 bg-card shadow-card"
              >
                <span className="text-lg">{ACTION_ICONS[entry.action] ?? "\uD83D\uDCCB"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {entry.action} {entry.entity}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{entry.entityId}</p>
                </div>
                <time className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(entry.createdAt)}
                </time>
              </div>
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/activity" />
        </>
      )}
    </div>
  );
}

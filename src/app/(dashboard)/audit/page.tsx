import { count, desc, eq } from "drizzle-orm";
import { ScrollText } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { EmptyState, SectionHeader, TableShell } from "@/components/ui/page";
import { auditLog } from "@/db/schema";
import { requireTenant } from "@/lib/action-wrapper";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { AUDIT_ACTION_LABELS, labelKey } from "@/lib/labels";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Audit");
  return { title: t("title") };
}

const PAGE_SIZE = 20;

const ACTION_VARIANTS = {
  CREATE: "success",
  UPDATE: "primary",
  DELETE: "destructive",
} as const;

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const t = await getTranslations("Audit");
  const locale = await getLocale();
  const { tenantId } = await requireTenant();
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
      <SectionHeader title={t("title")} description={t("subtitle")}>
        <Badge variant="outline">{totalRow?.count ?? 0}</Badge>
      </SectionHeader>

      {entries.length === 0 && currentPage === 1 ? (
        <EmptyState icon={<ScrollText className="h-5 w-5" />}>{t("noEntries")}</EmptyState>
      ) : (
        <>
          <TableShell>
            <table className="w-full text-sm">
              <thead>
                <tr className="table-row-head">
                  <th className="table-head">{t("action")}</th>
                  <th className="table-head">{t("entity")}</th>
                  <th className="table-head">{t("entityId")}</th>
                  <th className="table-head text-right">{t("when")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((entry) => (
                  <tr key={entry.id} className="transition-colors hover:bg-muted/40">
                    <td className="cell-pad">
                      <Badge
                        variant={
                          ACTION_VARIANTS[entry.action as keyof typeof ACTION_VARIANTS] ?? "default"
                        }
                      >
                        {t(labelKey(AUDIT_ACTION_LABELS, entry.action))}
                      </Badge>
                    </td>
                    <td className="cell-pad font-medium capitalize">{entry.entity}</td>
                    <td className="cell-pad">
                      <span className="font-mono text-xs text-muted-foreground">
                        {entry.entityId ?? "—"}
                      </span>
                    </td>
                    <td className="table-num text-right">
                      {formatDateTime(entry.createdAt, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
          <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/audit" />
        </>
      )}
    </div>
  );
}

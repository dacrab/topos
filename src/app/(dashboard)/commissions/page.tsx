import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { CheckCircle2, Wallet } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { NewCommissionForm } from "@/components/dashboard/NewCommissionForm";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { SectionHeader, TableShell } from "@/components/ui/page";
import { StatCard } from "@/components/ui/stat";
import { commission, deal, teamMember, user } from "@/db/schema";
import { requireTenant } from "@/lib/action-wrapper";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { COMMISSION_STATUS_LABELS, COMMISSION_TYPE_LABELS, labelKey } from "@/lib/labels";
import { getInitials } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Commissions");
  return { title: t("title") };
}

const PAGE_SIZE = 20;

export default async function CommissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const t = await getTranslations("Commissions");
  const locale = await getLocale();
  const { tenantId } = await requireTenant();
  const { page } = await searchParams;

  const currentPage = Math.max(1, Number(page) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [commissions, [totalRow], dealRows, agentRows] = await Promise.all([
    db
      .select({
        id: commission.id,
        amount: commission.amount,
        type: commission.type,
        status: commission.status,
        paidAt: commission.paidAt,
        agentName: user.name,
        agentEmail: user.email,
        dealName: deal.name,
      })
      .from(commission)
      .innerJoin(teamMember, eq(commission.agentId, teamMember.id))
      .innerJoin(user, eq(teamMember.userId, user.id))
      .innerJoin(deal, eq(commission.dealId, deal.id))
      .where(eq(commission.tenantId, tenantId))
      .orderBy(desc(commission.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ count: count() }).from(commission).where(eq(commission.tenantId, tenantId)),
    db
      .select({ id: deal.id, name: deal.name })
      .from(deal)
      .where(eq(deal.tenantId, tenantId))
      .orderBy(desc(deal.createdAt)),
    db
      .select({ id: teamMember.id, name: user.name, email: user.email })
      .from(teamMember)
      .innerJoin(user, eq(teamMember.userId, user.id))
      .where(eq(teamMember.tenantId, tenantId)),
  ]);

  const dealOptions = dealRows.map((d) => ({ value: d.id, label: d.name }));
  const agentOptions = agentRows.map((a) => ({ value: a.id, label: a.name ?? a.email }));

  const totalPages = Math.ceil((totalRow?.count ?? 0) / PAGE_SIZE);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [[pendingRow], [paidRow]] = await Promise.all([
    db
      .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(commission)
      .where(and(eq(commission.tenantId, tenantId), eq(commission.status, "pending"))),
    db
      .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(commission)
      .where(
        and(
          eq(commission.tenantId, tenantId),
          eq(commission.status, "paid"),
          gte(commission.paidAt, startOfMonth),
        ),
      ),
  ]);

  const totalPending = pendingRow?.total ?? 0;
  const paidThisMonth = paidRow?.total ?? 0;

  return (
    <div className="space-y-6">
      <SectionHeader title={t("title")} description={t("subtitle")}>
        <NewCommissionForm deals={dealOptions} agents={agentOptions} />
      </SectionHeader>

      <div className="grid gap-px border-y border-border bg-border sm:grid-cols-2">
        <StatCard
          title={t("totalPending")}
          value={formatCurrency(totalPending, false, locale)}
          icon={Wallet}
        />
        <StatCard
          title={t("paidThisMonth")}
          value={formatCurrency(paidThisMonth, false, locale)}
          icon={CheckCircle2}
        />
      </div>

      <TableShell>
        <table className="w-full text-sm">
          <thead>
            <tr className="table-row-head">
              {["agent", "deal", "amount", "type", "status", "paidDate"].map((col) => (
                <th key={col} className="table-head">
                  {t(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {commissions.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-muted/40">
                <td className="cell-pad">
                  <div className="flex items-center gap-3">
                    <span className="avatar-sm">{getInitials(c.agentName, c.agentEmail)}</span>
                    <span className="font-medium">{c.agentName ?? c.agentEmail}</span>
                  </div>
                </td>
                <td className="cell-pad text-muted-foreground">{c.dealName ?? "—"}</td>
                <td className="cell-pad font-mono text-xs font-medium tabular-nums text-foreground">
                  {c.amount ? formatCurrency(c.amount, false, locale) : "—"}
                </td>
                <td className="cell-pad text-muted-foreground">
                  {t(labelKey(COMMISSION_TYPE_LABELS, c.type))}
                </td>
                <td className="cell-pad">
                  <Badge variant={c.status === "paid" ? "success" : "warning"}>
                    {t(labelKey(COMMISSION_STATUS_LABELS, c.status))}
                  </Badge>
                </td>
                <td className="table-num">{c.paidAt ? formatDate(c.paidAt, locale) : "—"}</td>
              </tr>
            ))}
            {commissions.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  {t("noCommissions")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableShell>
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/commissions" />
    </div>
  );
}

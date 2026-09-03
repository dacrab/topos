import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NewCommissionForm } from "@/components/dashboard/NewCommissionForm";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/page";
import { commission, deal, teamMember, user } from "@/db/schema";
import { requireTenant } from "@/lib/action-wrapper";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";

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
  const { tenantId } = await requireTenant();
  const { page } = await searchParams;

  const currentPage = Math.max(1, Number(page) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [commissions, [totalRow]] = await Promise.all([
    db
      .select({
        id: commission.id,
        amount: commission.amount,
        type: commission.type,
        status: commission.status,
        paidAt: commission.paidAt,
        agentName: user.name,
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
  ]);

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
        <NewCommissionForm />
      </SectionHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="card-base p-5">
          <div className="text-xs text-muted-foreground font-medium">{t("totalPending")}</div>
          <div className="text-2xl font-semibold mt-1 tabular-nums">
            {formatCurrency(totalPending)}
          </div>
        </div>
        <div className="card-base p-5">
          <div className="text-xs text-muted-foreground font-medium">{t("paidThisMonth")}</div>
          <div className="text-2xl font-semibold mt-1 tabular-nums">
            {formatCurrency(paidThisMonth)}
          </div>
        </div>
      </div>

      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["agent", "deal", "amount", "type", "status", "paidDate"].map((col) => (
                  <th key={col} className="table-head">
                    {t(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {commissions.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium">{c.agentName ?? "—"}</td>
                  <td className="p-4 text-muted-foreground">{c.dealName ?? "—"}</td>
                  <td className="p-4 tabular-nums">{c.amount ? formatCurrency(c.amount) : "—"}</td>
                  <td className="p-4 capitalize text-muted-foreground">
                    {c.type.replace(/_/g, " ")}
                  </td>
                  <td className="p-4">
                    <Badge variant={c.status === "paid" ? "success" : "warning"}>{c.status}</Badge>
                  </td>
                  <td className="p-4 text-muted-foreground tabular-nums">
                    {c.paidAt ? formatDate(c.paidAt) : "—"}
                  </td>
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
        </div>
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/commissions" />
    </div>
  );
}

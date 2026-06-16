import { count, desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NewCommissionForm } from "@/components/dashboard/NewCommissionForm";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/page";
import { commission, deal, teamMember, user } from "@/db/schema";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { requireDashboardAuth } from "@/lib/page-helpers";

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
  const { tenantId } = await requireDashboardAuth();
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

  const totalPending = commissions
    .filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + (c.amount ?? 0), 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const paidThisMonth = commissions
    .filter((c) => c.status === "paid" && c.paidAt && c.paidAt >= startOfMonth)
    .reduce((sum, c) => sum + (c.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader title={t("title")} description={t("subtitle")} />
        <NewCommissionForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="border border-border/60 bg-card p-5 rounded-xl shadow-card">
          <div className="text-xs text-muted-foreground font-medium">{t("totalPending")}</div>
          <div className="text-2xl font-bold mt-1">{formatCurrency(totalPending)}</div>
        </div>
        <div className="border border-border/60 bg-card p-5 rounded-xl shadow-card">
          <div className="text-xs text-muted-foreground font-medium">{t("paidThisMonth")}</div>
          <div className="text-2xl font-bold mt-1">{formatCurrency(paidThisMonth)}</div>
        </div>
      </div>

      <div className="border border-border/60 bg-card overflow-x-auto rounded-xl shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40">
              <th className="p-4 text-left label-caps">{t("agent")}</th>
              <th className="p-4 text-left label-caps">{t("deal")}</th>
              <th className="p-4 text-left label-caps">{t("amount")}</th>
              <th className="p-4 text-left label-caps">{t("type")}</th>
              <th className="p-4 text-left label-caps">{t("status")}</th>
              <th className="p-4 text-left label-caps">{t("paidDate")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {commissions.map((c) => (
              <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                <td className="p-4 font-medium">{c.agentName ?? "—"}</td>
                <td className="p-4 text-muted-foreground">{c.dealName ?? "—"}</td>
                <td className="p-4">{c.amount ? formatCurrency(c.amount) : "—"}</td>
                <td className="p-4 capitalize">{c.type.replace(/_/g, " ")}</td>
                <td className="p-4">
                  <Badge variant={c.status === "paid" ? "success" : "warning"}>{c.status}</Badge>
                </td>
                <td className="p-4 text-muted-foreground">
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
      <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/commissions" />
    </div>
  );
}

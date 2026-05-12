import { count, desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { EmptyState, SectionHeader } from "@/components/ui/page";
import { contact } from "@/db/schema";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireDashboardAuth } from "@/lib/page-helpers";

export const metadata: Metadata = { title: "Contacts" };

const PAGE_SIZE = 20;

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const t = await getTranslations("Contacts");
  const { tenantId } = await requireDashboardAuth();
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [contacts, [totalRow]] = await Promise.all([
    db
      .select()
      .from(contact)
      .where(eq(contact.tenantId, tenantId))
      .orderBy(desc(contact.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ count: count() }).from(contact).where(eq(contact.tenantId, tenantId)),
  ]);

  const totalPages = Math.ceil((totalRow?.count ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <SectionHeader title={t("title")} description={t("subtitle")} />

      {contacts.length === 0 && currentPage === 1 ? (
        <EmptyState>
          {t("noContactsYet")} {t("noContactsDesc")}
        </EmptyState>
      ) : (
        <>
          <div className="overflow-x-auto border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  {["name", "email", "phone", "type", "created"].map((col) => (
                    <th key={col} className="px-6 py-3 text-left label-caps">
                      {t(col)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {c.firstName} {c.lastName}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{c.email || "—"}</td>
                    <td className="px-6 py-4 text-muted-foreground">{c.phone || "—"}</td>
                    <td className="px-6 py-4">
                      <Badge>{c.type}</Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs uppercase tracking-wide">
                      {formatDate(c.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/contacts" />
        </>
      )}
    </div>
  );
}

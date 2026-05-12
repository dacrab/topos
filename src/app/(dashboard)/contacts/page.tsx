import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ImportContacts } from "@/components/dashboard/ImportContacts";
import { SearchFilters } from "@/components/dashboard/SearchFilters";
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
  searchParams: Promise<{ page?: string; q?: string; type?: string }>;
}) {
  const t = await getTranslations("Contacts");
  const { tenantId } = await requireDashboardAuth();
  const { page, q, type } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const conditions = [eq(contact.tenantId, tenantId)];
  if (q) {
    conditions.push(
      or(
        ilike(contact.firstName, `%${q}%`),
        ilike(contact.lastName, `%${q}%`),
        ilike(contact.email, `%${q}%`),
      )!,
    );
  }
  if (type) conditions.push(eq(contact.type, type));

  const where = and(...conditions);

  const [contacts, [totalRow]] = await Promise.all([
    db
      .select()
      .from(contact)
      .where(where)
      .orderBy(desc(contact.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ count: count() }).from(contact).where(where),
  ]);

  const totalPages = Math.ceil((totalRow?.count ?? 0) / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <SectionHeader title={t("title")} description={t("subtitle")} />

      <ImportContacts />

      <SearchFilters
        filters={[
          { name: "q", type: "text", placeholder: "Search contacts..." },
          {
            name: "type",
            type: "select",
            options: [
              { value: "", label: "All Types" },
              { value: "LEAD", label: "Lead" },
              { value: "CLIENT", label: "Client" },
              { value: "VENDOR", label: "Vendor" },
              { value: "OTHER", label: "Other" },
            ],
          },
        ]}
      />

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

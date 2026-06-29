import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ImportContacts } from "@/components/dashboard/ImportContacts";
import { SearchFilters } from "@/components/dashboard/SearchFilters";
import { Pagination } from "@/components/pagination";
import { ArchTopBar } from "@/components/ui/arch-top";
import { Badge } from "@/components/ui/badge";
import { EmptyState, SectionHeader } from "@/components/ui/page";
import { contact } from "@/db/schema";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireDashboardAuth } from "@/lib/page-helpers";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Contacts");
  return { title: t("title") };
}

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
    const search = or(
      ilike(contact.firstName, `%${q}%`),
      ilike(contact.lastName, `%${q}%`),
      ilike(contact.email, `%${q}%`),
    );
    if (search) conditions.push(search);
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
          { name: "q", type: "text", placeholder: t("searchPlaceholder") },
          {
            name: "type",
            type: "select",
            options: [
              { value: "", label: t("allTypes") },
              { value: "LEAD", label: t("lead") },
              { value: "CLIENT", label: t("client") },
              { value: "VENDOR", label: t("vendor") },
              { value: "OTHER", label: t("other") },
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
          <div className="border border-border/40 bg-card shadow-card rounded-2xl overflow-hidden">
            <ArchTopBar opacity="5" className="h-2" />
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40">
                    {["name", "email", "phone", "type", "created"].map((col) => (
                      <th key={col} className="px-6 py-3.5 text-left label-caps">
                        {t(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {contacts.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {c.firstName} {c.lastName}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{c.email || "—"}</td>
                      <td className="px-6 py-4 text-muted-foreground">{c.phone || "—"}</td>
                      <td className="px-6 py-4">
                        <Badge>{c.type}</Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs tabular-nums">
                        {formatDate(c.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/contacts" />
        </>
      )}
    </div>
  );
}

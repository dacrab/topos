import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { Mail, Phone, Users } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ImportContacts } from "@/components/dashboard/ImportContacts";
import { SearchFilters } from "@/components/dashboard/SearchFilters";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { EmptyState, SectionHeader, TableShell } from "@/components/ui/page";
import { contact } from "@/db/schema";
import { requireTenant } from "@/lib/action-wrapper";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { getInitials } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Contacts");
  return { title: t("title") };
}

const PAGE_SIZE = 20;

const TYPE_VARIANTS = {
  LEAD: "primary",
  CLIENT: "success",
  VENDOR: "warning",
  OTHER: "default",
} as const;

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; type?: string }>;
}) {
  const t = await getTranslations("Contacts");
  const locale = await getLocale();
  const { tenantId } = await requireTenant();
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
      <SectionHeader title={t("title")} description={t("subtitle")}>
        <Badge variant="outline">{totalRow?.count ?? 0}</Badge>
      </SectionHeader>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
        <ImportContacts />
      </div>

      {contacts.length === 0 && currentPage === 1 ? (
        <EmptyState icon={<Users className="h-5 w-5" />}>
          <span className="block font-medium text-foreground">{t("noContactsYet")}</span>{" "}
          {t("noContactsDesc")}
        </EmptyState>
      ) : (
        <>
          <TableShell>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="table-row-head">
                  {["name", "email", "phone", "type", "created"].map((col) => (
                    <th key={col} className="table-head">
                      {t(col)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contacts.map((c) => {
                  const variant = TYPE_VARIANTS[c.type as keyof typeof TYPE_VARIANTS] ?? "default";
                  return (
                    <tr key={c.id} className="group transition-colors hover:bg-muted/40">
                      <td className="cell-pad">
                        <div className="flex items-center gap-3">
                          <span className="avatar-sm">
                            {getInitials(`${c.firstName} ${c.lastName}`, c.email ?? "")}
                          </span>
                          <span className="font-medium text-foreground">
                            {c.firstName} {c.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="cell-pad text-muted-foreground">
                        {c.email ? (
                          <a
                            href={`mailto:${c.email}`}
                            className="inline-flex items-center gap-1.5 hover:text-accent hover:underline"
                          >
                            <Mail className="h-3.5 w-3.5 shrink-0 opacity-60" />
                            {c.email}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="cell-pad text-muted-foreground">
                        {c.phone ? (
                          <a
                            href={`tel:${c.phone}`}
                            className="inline-flex items-center gap-1.5 hover:text-accent hover:underline"
                          >
                            <Phone className="h-3.5 w-3.5 shrink-0 opacity-60" />
                            {c.phone}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="cell-pad">
                        <Badge variant={variant}>{t(c.type.toLowerCase())}</Badge>
                      </td>
                      <td className="table-num">{formatDate(c.createdAt, locale)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableShell>
          <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/contacts" />
        </>
      )}
    </div>
  );
}

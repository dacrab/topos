import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DocumentPreview } from "@/components/dashboard/DocumentPreview";
import { UploadDocumentForm } from "@/components/dashboard/UploadDocumentForm";
import { Badge } from "@/components/ui/badge";
import { EmptyState, SectionHeader } from "@/components/ui/page";
import { document } from "@/db/schema";
import { requireTenant } from "@/lib/action-wrapper";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Documents");
  return { title: t("title") };
}

export default async function DocumentsPage() {
  const t = await getTranslations("Documents");
  const { tenantId } = await requireTenant();

  const documents = await db
    .select()
    .from(document)
    .where(eq(document.tenantId, tenantId))
    .orderBy(desc(document.createdAt));

  const columns = [t("name"), t("type"), t("linkedTo"), t("date"), t("size")] as const;

  return (
    <div className="space-y-6">
      <SectionHeader title={t("title")} description={t("subtitle")}>
        <UploadDocumentForm />
      </SectionHeader>

      {documents.length === 0 ? (
        <EmptyState>{t("noDocuments")}</EmptyState>
      ) : (
        <div className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {columns.map((col) => (
                    <th key={col} className="table-head">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      <DocumentPreview url={doc.url}>{doc.name}</DocumentPreview>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge>{doc.type}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {doc.dealId
                        ? t("deal")
                        : doc.listingId
                          ? t("listing")
                          : doc.contactId
                            ? t("contact")
                            : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs tabular-nums">
                      {formatDate(doc.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground tabular-nums">
                      {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

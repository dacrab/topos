import { desc, eq } from "drizzle-orm";
import {
  Download,
  File,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { DocumentPreview } from "@/components/dashboard/DocumentPreview";
import { UploadDocumentForm } from "@/components/dashboard/UploadDocumentForm";
import { Badge } from "@/components/ui/badge";
import { EmptyState, SectionHeader, TableShell } from "@/components/ui/page";
import { document } from "@/db/schema";
import { requireTenant } from "@/lib/action-wrapper";
import { db } from "@/lib/db";
import { type FileKind, fileKind, formatFileSize } from "@/lib/files";
import { formatDate } from "@/lib/format";
import { DOCUMENT_TYPE_LABELS, labelKey } from "@/lib/labels";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Documents");
  return { title: t("title") };
}

const FILE_ICONS = {
  image: ImageIcon,
  pdf: FileText,
  spreadsheet: FileSpreadsheet,
  archive: FileArchive,
  document: FileText,
  other: File,
} as const satisfies Record<FileKind, typeof File>;

const TYPE_VARIANTS = {
  contract: "primary",
  disclosure: "warning",
  inspection: "success",
  appraisal: "outline",
  other: "default",
} as const;

export default async function DocumentsPage() {
  const t = await getTranslations("Documents");
  const locale = await getLocale();
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
        <EmptyState icon={<FileText className="h-5 w-5" />}>{t("noDocuments")}</EmptyState>
      ) : (
        <TableShell>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="table-row-head">
                {columns.map((col) => (
                  <th key={col} className="table-head">
                    {col}
                  </th>
                ))}
                <th className="table-head">
                  <span className="sr-only">{t("downloadFile")}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {documents.map((doc) => {
                const kind = fileKind(doc.url);
                const Icon = FILE_ICONS[kind];
                const typeVariant =
                  TYPE_VARIANTS[doc.type as keyof typeof TYPE_VARIANTS] ?? "default";
                return (
                  <tr key={doc.id} className="group transition-colors hover:bg-muted/40">
                    <td className="cell-pad">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-transparent text-muted-foreground">
                          <Icon className="h-4 w-4" />
                        </span>
                        <DocumentPreview url={doc.url}>{doc.name}</DocumentPreview>
                      </div>
                    </td>
                    <td className="cell-pad">
                      <Badge variant={typeVariant}>
                        {t(labelKey(DOCUMENT_TYPE_LABELS, doc.type))}
                      </Badge>
                    </td>
                    <td className="cell-pad text-muted-foreground">
                      {doc.dealId
                        ? t("deal")
                        : doc.listingId
                          ? t("listing")
                          : doc.contactId
                            ? t("contact")
                            : "—"}
                    </td>
                    <td className="table-num">{formatDate(doc.createdAt, locale)}</td>
                    <td className="table-num">{formatFileSize(doc.size) ?? "—"}</td>
                    <td className="cell-pad text-right">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        aria-label={`${t("downloadFile")}: ${doc.name}`}
                        className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableShell>
      )}
    </div>
  );
}

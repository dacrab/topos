import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { DocumentPreview } from "@/components/dashboard/DocumentPreview";
import { Badge } from "@/components/ui/badge";
import { EmptyState, SectionHeader } from "@/components/ui/page";
import { document } from "@/db/schema";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { requireDashboardAuth } from "@/lib/page-helpers";

export const metadata: Metadata = { title: "Documents" };

export default async function DocumentsPage() {
  const { tenantId } = await requireDashboardAuth();

  const documents = await db
    .select()
    .from(document)
    .where(eq(document.tenantId, tenantId))
    .orderBy(desc(document.createdAt));

  return (
    <div className="space-y-6">
      <SectionHeader title="Documents" description="Manage your files and documents" />

      {documents.length === 0 ? (
        <EmptyState>No documents uploaded yet.</EmptyState>
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                {["Name", "Type", "Linked To", "Date", "Size"].map((col) => (
                  <th key={col} className="px-6 py-3 text-left label-caps">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    <DocumentPreview url={doc.url} type={doc.type}>
                      {doc.name}
                    </DocumentPreview>
                  </td>
                  <td className="px-6 py-4">
                    <Badge>{doc.type}</Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {doc.dealId
                      ? "Deal"
                      : doc.listingId
                        ? "Listing"
                        : doc.contactId
                          ? "Contact"
                          : "—"}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs uppercase tracking-wide">
                    {formatDate(doc.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

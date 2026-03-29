import { desc, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { SectionHeader } from "@/components/ui";
import { contact } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const t = await getTranslations("Contacts");
  const tenant = await getCurrentTenant();

  const contacts = await db
    .select()
    .from(contact)
    .where(eq(contact.tenantId, tenant.id))
    .orderBy(desc(contact.createdAt));

  return (
    <div className="space-y-6">
      <SectionHeader title={t("title")} description={t("subtitle")} />

      {contacts.length === 0 ? (
        <div className="empty-state">
          {t("noContactsYet")} {t("noContactsDesc")}
        </div>
      ) : (
        <div className="overflow-x-auto border border-border/60">
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
            <tbody className="divide-y divide-border/60">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {c.firstName} {c.lastName}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{c.email || "—"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{c.phone || "—"}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground border border-border/40">
                      {c.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs uppercase tracking-wide">
                    {c.createdAt.toLocaleDateString()}
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

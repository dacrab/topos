import { desc, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
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
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="text-muted-foreground font-light">{t("subtitle")}</p>
      </div>

      {contacts.length === 0 ? (
        <div className="border border-dashed border-border/60 p-12 text-center text-muted-foreground">
          {t("noContactsYet")} {t("noContactsDesc")}
        </div>
      ) : (
        <div className="overflow-x-auto border border-border/60">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {t("name")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {t("email")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {t("phone")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {t("type")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {t("created")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {c.firstName} {c.lastName}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {c.email || "—"}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {c.phone || "—"}
                  </td>
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

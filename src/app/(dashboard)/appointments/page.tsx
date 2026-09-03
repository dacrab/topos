import { and, asc, eq, gte } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NewAppointmentForm } from "@/components/dashboard/NewAppointmentForm";
import { Badge } from "@/components/ui/badge";
import { EmptyState, SectionHeader } from "@/components/ui/page";
import { appointment } from "@/db/schema";
import { requireTenant } from "@/lib/action-wrapper";
import { db } from "@/lib/db";
import { formatDate, formatTime } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Appointments");
  return { title: t("title") };
}

export default async function AppointmentsPage() {
  const t = await getTranslations("Appointments");
  const { tenantId } = await requireTenant();

  const appointments = await db
    .select()
    .from(appointment)
    .where(and(eq(appointment.tenantId, tenantId), gte(appointment.startAt, new Date())))
    .orderBy(asc(appointment.startAt));

  const columns = [
    t("titleCol"),
    t("type"),
    t("date"),
    t("time"),
    t("listing"),
    t("contact"),
  ] as const;

  return (
    <div className="space-y-6">
      <SectionHeader title={t("title")} description={t("subtitle")}>
        <NewAppointmentForm />
      </SectionHeader>

      {appointments.length === 0 ? (
        <EmptyState>{t("noAppointments")}</EmptyState>
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
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      <span className="flex items-center gap-2">
                        {apt.title}
                        {apt.recurrence && (
                          <Badge variant="primary" className="text-xs">
                            {apt.recurrence}
                          </Badge>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge>{apt.type}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs tabular-nums">
                      {formatDate(apt.startAt)}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground tabular-nums">
                      {formatTime(apt.startAt)} – {formatTime(apt.endAt)}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {apt.listingId ? t("yes") : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {apt.contactId ? t("yes") : "—"}
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

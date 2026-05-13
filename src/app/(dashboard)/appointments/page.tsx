import { and, asc, eq, gte } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NewAppointmentForm } from "@/components/dashboard/NewAppointmentForm";
import { Badge } from "@/components/ui/badge";
import { EmptyState, SectionHeader } from "@/components/ui/page";
import { appointment } from "@/db/schema";
import { db } from "@/lib/db";
import { formatDate, formatTime } from "@/lib/format";
import { requireDashboardAuth } from "@/lib/page-helpers";

export const metadata: Metadata = { title: "Appointments" };

export default async function AppointmentsPage() {
  const t = await getTranslations("Appointments");
  const { tenantId } = await requireDashboardAuth();

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
      <div className="flex items-center justify-between">
        <SectionHeader title={t("title")} description={t("subtitle")} />
        <NewAppointmentForm />
      </div>

      {appointments.length === 0 ? (
        <EmptyState>{t("noAppointments")}</EmptyState>
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="px-6 py-3 text-left label-caps">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    <span className="flex items-center gap-2">
                      {apt.title}
                      {apt.recurrence && (
                        <Badge variant="primary" className="text-xs">
                          {apt.recurrence}
                        </Badge>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge>{apt.type}</Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs uppercase tracking-wide">
                    {formatDate(apt.startAt)}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {formatTime(apt.startAt)} – {formatTime(apt.endAt)}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{apt.listingId ? "Yes" : "—"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{apt.contactId ? "Yes" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { and, asc, eq, gte } from "drizzle-orm";
import { Calendar, Clock, Home, User } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { NewAppointmentForm } from "@/components/dashboard/NewAppointmentForm";
import { Badge } from "@/components/ui/badge";
import { EmptyState, SectionHeader } from "@/components/ui/page";
import { appointment, contact, listing } from "@/db/schema";
import { requireTenant } from "@/lib/action-wrapper";
import { db } from "@/lib/db";
import { formatDate, formatTime } from "@/lib/format";
import { APPOINTMENT_TYPE_LABELS, labelKey, RECURRENCE_LABELS } from "@/lib/labels";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Appointments");
  return { title: t("title") };
}

export default async function AppointmentsPage() {
  const t = await getTranslations("Appointments");
  const locale = await getLocale();
  const { tenantId } = await requireTenant();

  const appointments = await db
    .select({
      id: appointment.id,
      title: appointment.title,
      type: appointment.type,
      recurrence: appointment.recurrence,
      startAt: appointment.startAt,
      endAt: appointment.endAt,
      listingTitle: listing.title,
      contactFirstName: contact.firstName,
      contactLastName: contact.lastName,
    })
    .from(appointment)
    .leftJoin(listing, eq(appointment.listingId, listing.id))
    .leftJoin(contact, eq(appointment.contactId, contact.id))
    .where(and(eq(appointment.tenantId, tenantId), gte(appointment.startAt, new Date())))
    .orderBy(asc(appointment.startAt));

  const groups = new Map<string, typeof appointments>();
  for (const item of appointments) {
    const key = new Date(item.startAt).toDateString();
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }

  return (
    <div className="space-y-8">
      <SectionHeader title={t("title")} description={t("subtitle")}>
        <NewAppointmentForm />
      </SectionHeader>

      {appointments.length === 0 ? (
        <EmptyState icon={<Calendar className="h-5 w-5" />}>{t("noAppointments")}</EmptyState>
      ) : (
        <div className="space-y-8">
          {[...groups.values()].map((group) => (
            <section key={group[0]?.id} className="space-y-0">
              <div className="flex items-baseline gap-3 border-b-2 border-foreground/85 pb-2">
                <span className="index-caps">{String(group.length).padStart(2, "0")}</span>
                <h2 className="font-display text-lg tracking-[-0.01em]">
                  {formatDate(group[0]?.startAt ?? new Date(), locale)}
                </h2>
              </div>

              <div className="space-y-0">
                {group.map((apt) => {
                  const contactName = [apt.contactFirstName, apt.contactLastName]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <article
                      key={apt.id}
                      className="flex gap-4 border-b border-border py-4 sm:items-center"
                    >
                      <div className="flex w-[4.5rem] shrink-0 flex-col items-center justify-center gap-0.5 border-l-2 border-accent py-1.5 pl-3">
                        <span className="font-mono text-sm font-medium text-foreground tabular-nums">
                          {formatTime(apt.startAt, locale)}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[0.5625rem] text-muted-foreground tabular-nums">
                          <Clock className="h-2.5 w-2.5" />
                          {formatTime(apt.endAt, locale)}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-medium text-foreground">{apt.title}</h3>
                          <Badge>{t(labelKey(APPOINTMENT_TYPE_LABELS, apt.type))}</Badge>
                          {apt.recurrence && (
                            <Badge variant="outline">
                              {t(labelKey(RECURRENCE_LABELS, apt.recurrence))}
                            </Badge>
                          )}
                        </div>

                        {(apt.listingTitle || contactName) && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 micro-caps text-muted-foreground">
                            {apt.listingTitle && (
                              <span className="flex min-w-0 items-center gap-1.5">
                                <Home className="h-3 w-3 shrink-0" />
                                <span className="truncate">{apt.listingTitle}</span>
                              </span>
                            )}
                            {contactName && (
                              <span className="flex min-w-0 items-center gap-1.5">
                                <User className="h-3 w-3 shrink-0" />
                                <span className="truncate">{contactName}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

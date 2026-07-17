"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { appointment } from "@/db/schema";
import { APPOINTMENT_TYPES, RECURRENCE_OPTIONS } from "@/lib/config";
import { db } from "@/lib/db";
import { requireDashboardAuth } from "@/lib/page-helpers";

const appointmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(APPOINTMENT_TYPES),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  notes: z.string().optional().nullable(),
  listingId: z.string().optional().nullable(),
  contactId: z.string().optional().nullable(),
  agentId: z.string().optional().nullable(),
  recurrence: z.enum(RECURRENCE_OPTIONS).optional().nullable(),
  recurrenceEnd: z.coerce.date().optional().nullable(),
});

function addInterval(date: Date, recurrence: string): Date {
  const next = new Date(date);
  switch (recurrence) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "biweekly":
      next.setDate(next.getDate() + 14);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
  }
  return next;
}

async function expandRecurringAppointments(parentId: string) {
  const { tenantId } = await requireDashboardAuth();

  const [parent] = await db
    .select()
    .from(appointment)
    .where(and(eq(appointment.id, parentId), eq(appointment.tenantId, tenantId)))
    .limit(1);

  if (!parent?.recurrence) return [];

  const duration = parent.endAt.getTime() - parent.startAt.getTime();
  const end = parent.recurrenceEnd ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const limit = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const cutoff = end < limit ? end : limit;

  const values: (typeof appointment.$inferInsert)[] = [];
  let startAt = addInterval(parent.startAt, parent.recurrence);

  while (startAt <= cutoff) {
    const endAt = new Date(startAt.getTime() + duration);
    values.push({
      title: parent.title,
      type: parent.type,
      startAt: new Date(startAt),
      endAt,
      notes: parent.notes,
      recurrence: parent.recurrence,
      parentId,
      listingId: parent.listingId,
      contactId: parent.contactId,
      agentId: parent.agentId,
      tenantId: parent.tenantId,
    });
    startAt = addInterval(startAt, parent.recurrence);
  }

  const instances =
    values.length > 0 ? await db.insert(appointment).values(values).returning() : [];

  revalidatePath("/appointments");
  return instances;
}

export async function createAppointment(data: z.infer<typeof appointmentSchema>) {
  const { tenantId } = await requireDashboardAuth();
  const parsed = appointmentSchema.parse(data);
  const [created] = await db
    .insert(appointment)
    .values({ ...parsed, tenantId })
    .returning();

  if (parsed.recurrence && created) {
    await expandRecurringAppointments(created.id);
  }

  revalidatePath("/appointments");
  return { success: true as const, appointment: created };
}

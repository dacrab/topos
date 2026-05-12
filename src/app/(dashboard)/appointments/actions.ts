"use server";

import { and, desc, eq, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { appointment } from "@/db/schema";
import { APPOINTMENT_TYPES, RECURRENCE_OPTIONS } from "@/lib/config";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

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

export async function expandRecurringAppointments(parentId: string) {
  const tenant = await getCurrentTenant();

  const [parent] = await db
    .select()
    .from(appointment)
    .where(and(eq(appointment.id, parentId), eq(appointment.tenantId, tenant.id)));

  if (!parent || !parent.recurrence) return [];

  const duration = parent.endAt.getTime() - parent.startAt.getTime();
  const end = parent.recurrenceEnd ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const limit = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const cutoff = end < limit ? end : limit;

  const instances: (typeof parent)[] = [];
  let startAt = addInterval(parent.startAt, parent.recurrence);

  while (startAt <= cutoff) {
    const endAt = new Date(startAt.getTime() + duration);
    const [inst] = await db
      .insert(appointment)
      .values({
        title: parent.title,
        type: parent.type,
        startAt,
        endAt,
        notes: parent.notes,
        recurrence: parent.recurrence,
        parentId,
        listingId: parent.listingId,
        contactId: parent.contactId,
        agentId: parent.agentId,
        tenantId: tenant.id,
      })
      .returning();
    if (inst) instances.push(inst);
    startAt = addInterval(startAt, parent.recurrence);
  }

  revalidatePath("/appointments");
  return instances;
}

export async function createAppointment(data: z.infer<typeof appointmentSchema>) {
  const tenant = await getCurrentTenant();
  const parsed = appointmentSchema.parse(data);

  const [created] = await db
    .insert(appointment)
    .values({ ...parsed, tenantId: tenant.id })
    .returning();

  if (parsed.recurrence && created) {
    await expandRecurringAppointments(created.id);
  }

  revalidatePath("/appointments");
  return { success: true as const, appointment: created };
}

export async function updateAppointment(
  id: string,
  data: Partial<z.infer<typeof appointmentSchema>>,
) {
  const tenant = await getCurrentTenant();

  const [updated] = await db
    .update(appointment)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(appointment.id, id), eq(appointment.tenantId, tenant.id)))
    .returning();

  if (!updated) throw new Error("Appointment not found");

  revalidatePath("/appointments");
  return { success: true as const, appointment: updated };
}

export async function deleteAppointment(id: string) {
  const tenant = await getCurrentTenant();

  const [deleted] = await db
    .delete(appointment)
    .where(and(eq(appointment.id, id), eq(appointment.tenantId, tenant.id)))
    .returning();

  if (!deleted) throw new Error("Appointment not found");

  revalidatePath("/appointments");
  return { success: true as const };
}

export async function listAppointments(filters?: { from?: Date; to?: Date }) {
  const tenant = await getCurrentTenant();

  const conditions = [eq(appointment.tenantId, tenant.id)];
  if (filters?.from) conditions.push(gte(appointment.startAt, filters.from));
  if (filters?.to) conditions.push(lte(appointment.startAt, filters.to));

  return db
    .select()
    .from(appointment)
    .where(and(...conditions))
    .orderBy(desc(appointment.startAt));
}

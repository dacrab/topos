"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { appointment, contact, listing, teamMember } from "@/db/schema";
import { withTenant } from "@/lib/action-wrapper";
import { checkRefs, logAudit } from "@/lib/activity";
import { APPOINTMENT_TYPES, RECURRENCE_OPTIONS } from "@/lib/config";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/types";
import { validationError } from "@/lib/validation";
import { dispatchWebhook } from "@/lib/webhook";

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

async function expandRecurringAppointments(tenantId: string, parentId: string) {
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

export async function createAppointment(
  data: z.infer<typeof appointmentSchema>,
): Promise<ActionResult> {
  return withTenant(async ({ tenantId }) => {
    const parsed = appointmentSchema.safeParse(data);
    if (!parsed.success) return validationError(parsed.error);
    const v = parsed.data;

    const missing = await checkRefs(tenantId, [
      { table: listing, id: v.listingId, label: "Listing" },
      { table: contact, id: v.contactId, label: "Contact" },
      { table: teamMember, id: v.agentId, label: "Agent" },
    ]);
    if (missing) return { success: false, message: missing };

    const [created] = await db
      .insert(appointment)
      .values({ ...v, tenantId })
      .returning();

    await logAudit({ tenantId, action: "CREATE", entity: "appointment", entityId: created?.id });
    await dispatchWebhook(tenantId, "appointment.created", {
      id: created?.id,
      title: created?.title,
      startAt: created?.startAt,
    });

    if (v.recurrence && created) {
      await expandRecurringAppointments(tenantId, created.id);
    }

    revalidatePath("/appointments");
    return { success: true, message: "Appointment created", appointment: created };
  });
}

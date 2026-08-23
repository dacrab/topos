import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { activity, auditLog } from "@/db/schema";
import { db } from "./db";

const ACTIVITY_TYPES = ["LISTING_CREATED", "INQUIRY", "DEAL_CREATED", "DOCUMENT_ADDED"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

const AUDIT_ACTIONS = ["CREATE", "UPDATE", "DELETE"] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export async function logActivity(input: {
  tenantId: string;
  type: ActivityType;
  title: string;
  description?: string | null;
  listingId?: string | null;
  contactId?: string | null;
}): Promise<void> {
  try {
    await db.insert(activity).values({
      tenantId: input.tenantId,
      type: input.type,
      title: input.title,
      description: input.description ?? null,
      listingId: input.listingId ?? null,
      contactId: input.contactId ?? null,
    });
  } catch (err) {
    Sentry.captureException(err, { extra: { scope: "activity-feed" } });
  }
}

export async function logAudit(input: {
  tenantId: string;
  userId?: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string | null | undefined;
}): Promise<void> {
  try {
    await db.insert(auditLog).values({
      tenantId: input.tenantId,
      userId: input.userId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? "",
    });
  } catch (err) {
    Sentry.captureException(err, { extra: { scope: "audit-log" } });
  }
}

export async function refExists(
  table: PgTable,
  idCol: PgColumn,
  tenantCol: PgColumn,
  id: string,
  tenantId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: idCol })
    .from(table)
    .where(and(eq(idCol, id), eq(tenantCol, tenantId)))
    .limit(1);
  return row !== undefined;
}

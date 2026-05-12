"use server";

import { and, desc, eq } from "drizzle-orm";
import { auditLog } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

export async function getEntityActivity(entityType: string, entityId: string) {
  const tenant = await getCurrentTenant();
  return db
    .select()
    .from(auditLog)
    .where(
      and(
        eq(auditLog.tenantId, tenant.id),
        eq(auditLog.entity, entityType),
        eq(auditLog.entityId, entityId),
      ),
    )
    .orderBy(desc(auditLog.createdAt))
    .limit(50);
}

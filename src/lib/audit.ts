import { auth } from "@clerk/nextjs/server";
import { auditLog } from "@/db/schema";
import { getCurrentTenant } from "./currentTenant";
import { db } from "./db";

export async function logAudit(
  action: string,
  entity: string,
  entityId: string,
  changes?: Record<string, unknown>,
) {
  const { userId } = await auth();
  if (!userId) return;
  const tenant = await getCurrentTenant(userId);
  await db.insert(auditLog).values({
    action,
    entity,
    entityId,
    changes: changes ?? {},
    userId,
    tenantId: tenant.id,
  });
}

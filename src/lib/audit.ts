import { auditLog } from "@/db/schema";
import { getSession } from "./auth";
import { getCurrentTenant } from "./currentTenant";
import { db } from "./db";

export async function logAudit(
  action: string,
  entity: string,
  entityId: string,
  changes?: Record<string, unknown>,
) {
  const session = await getSession();
  const tenant = await getCurrentTenant();
  await db.insert(auditLog).values({
    action,
    entity,
    entityId,
    changes: changes ?? {},
    userId: session?.user.id ?? null,
    tenantId: tenant.id,
  });
}

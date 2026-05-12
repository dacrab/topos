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

/** Convenience wrapper for use in server actions */
export function withAudit<T extends (...args: never[]) => Promise<unknown>>(
  fn: T,
  getAuditInfo: (...args: Parameters<T>) => {
    action: string;
    entity: string;
    entityId: string;
    changes?: Record<string, unknown>;
  },
): T {
  return (async (...args: Parameters<T>) => {
    const result = await fn(...args);
    const { action, entity, entityId, changes } = getAuditInfo(...args);
    await logAudit(action, entity, entityId, changes);
    return result;
  }) as unknown as T;
}

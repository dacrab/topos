import { getSession } from "./auth";
import { getCurrentTenant } from "./currentTenant";
import type { ActionResult } from "./types";

export async function withAuth<T>(
  handler: (userId: string) => Promise<T>
): Promise<T | ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated" };
  return handler(session.user.id);
}

export async function withAdmin<T>(
  handler: (userId: string, tenantId: string) => Promise<T>
): Promise<T | ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated" };
  
  const tenant = await getCurrentTenant();
  const { db } = await import("./db");
  const { teamMember } = await import("@/db/schema");
  const { and, eq } = await import("drizzle-orm");
  
  const member = await db
    .select()
    .from(teamMember)
    .where(and(eq(teamMember.userId, session.user.id), eq(teamMember.tenantId, tenant.id)))
    .limit(1)
    .then(r => r[0]);
  
  if (!member || !["owner", "admin"].includes(member.role)) {
    return { success: false, message: "You don't have permission" };
  }
  
  return handler(session.user.id, tenant.id);
}

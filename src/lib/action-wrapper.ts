import { and, eq } from "drizzle-orm";
import { teamMember } from "@/db/schema";
import { getSession } from "./auth";
import { ADMIN_ROLES } from "./config";
import { getCurrentTenant } from "./currentTenant";
import { db } from "./db";
import type { ActionResult } from "./types";

function handleError(error: unknown, fallback: string): ActionResult {
  return {
    success: false,
    message: error instanceof Error ? error.message : fallback,
  };
}

export async function withAuth<T>(
  handler: (userId: string) => Promise<T>,
): Promise<T | ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated" };
  try {
    return await handler(session.user.id);
  } catch (error) {
    return handleError(error, "Action failed");
  }
}

export async function withAdmin<T>(
  handler: (userId: string, tenantId: string) => Promise<T>,
): Promise<T | ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated" };

  const tenant = await getCurrentTenant();

  const [member] = await db
    .select()
    .from(teamMember)
    .where(and(eq(teamMember.userId, session.user.id), eq(teamMember.tenantId, tenant.id)))
    .limit(1);

  if (!member || !ADMIN_ROLES.includes(member.role as (typeof ADMIN_ROLES)[number])) {
    return { success: false, message: "You don't have permission" };
  }

  try {
    return await handler(session.user.id, tenant.id);
  } catch (error) {
    return handleError(error, "Action failed");
  }
}

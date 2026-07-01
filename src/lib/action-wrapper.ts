import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { teamMember } from "@/db/schema";
import { ADMIN_ROLES, type TeamRole } from "./config";
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
  const { userId } = await auth();
  if (!userId) return { success: false, message: "Not authenticated" };
  try {
    return await handler(userId);
  } catch (error) {
    return handleError(error, "Action failed");
  }
}

export async function withAdmin<T>(
  handler: (userId: string, tenantId: string) => Promise<T>,
): Promise<T | ActionResult> {
  const { userId } = await auth();
  if (!userId) return { success: false, message: "Not authenticated" };

  const tenant = await getCurrentTenant(userId);

  const [member] = await db
    .select()
    .from(teamMember)
    .where(and(eq(teamMember.userId, userId), eq(teamMember.tenantId, tenant.id)))
    .limit(1);

  if (!member || !ADMIN_ROLES.includes(member.role as TeamRole)) {
    return { success: false, message: "You don't have permission" };
  }

  try {
    return await handler(userId, tenant.id);
  } catch (error) {
    return handleError(error, "Action failed");
  }
}

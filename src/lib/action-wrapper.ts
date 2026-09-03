import { auth, currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { teamMember, tenant, user } from "@/db/schema";
import { ADMIN_ROLES, isTeamRole } from "./config";
import { db } from "./db";
import type { ActionResult } from "./types";
import { deriveDisplayName } from "./utils";

type TenantRow = typeof tenant.$inferSelect;

async function ensureUserExists(id: string): Promise<void> {
  const [existing] = await db.select().from(user).where(eq(user.id, id)).limit(1);
  if (existing) return;

  const clerkUser = await currentUser();
  if (!clerkUser) return;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const name = deriveDisplayName({
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    email,
  });
  await db.insert(user).values({ id, email, name }).onConflictDoNothing({ target: user.id });
}

const getCurrentTenant = cache(async (userId: string): Promise<TenantRow> => {
  await ensureUserExists(userId);

  const [existingUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);

  if (existingUser?.tenantId) {
    const [existingTenant] = await db
      .select()
      .from(tenant)
      .where(eq(tenant.id, existingUser.tenantId))
      .limit(1);
    if (existingTenant) return existingTenant;
  }

  throw new Error("No tenant found");
});

export type TenantCtx = {
  userId: string;
  tenantId: string;
  tenant: TenantRow;
};

// Internal app paths only — prevents open-redirect via crafted x-pathname.
function safeReturnTo(path: string | null): string {
  if (!path?.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return "/dashboard";
  }
  return path;
}

// For server components and route handlers: redirects unauthenticated visitors
// back to the page they requested once they sign in.
export async function requireTenant(): Promise<TenantCtx> {
  const userId = (await auth()).userId;
  if (!userId) {
    const pathname = (await headers()).get("x-pathname");
    redirect(`/sign-in?redirect_url=${encodeURIComponent(safeReturnTo(pathname))}`);
  }

  const t = await getCurrentTenant(userId);
  return { userId, tenantId: t.id, tenant: t };
}

function handleError(error: unknown): ActionResult {
  return {
    success: false,
    message: error instanceof Error ? error.message : "Action failed",
  };
}

// Authenticated-only wrapper for actions valid without a tenant (profile, notifications, onboarding).
export async function withUser<T>(
  handler: (userId: string) => Promise<T>,
): Promise<T | ActionResult> {
  try {
    const userId = (await auth()).userId;
    if (!userId) return { success: false, message: "Not authenticated" };
    return await handler(userId);
  } catch (error) {
    return handleError(error);
  }
}

// Tenant-scoped wrapper. Pass { admin: true } to restrict to owner/admin roles.
export async function withTenant<T>(
  handler: (ctx: TenantCtx) => Promise<T>,
  opts?: { admin?: boolean },
): Promise<T | ActionResult> {
  try {
    const userId = (await auth()).userId;
    if (!userId) return { success: false, message: "Not authenticated" };

    let tenantRow: TenantRow;
    try {
      tenantRow = await getCurrentTenant(userId);
    } catch {
      return { success: false, message: "No workspace found" };
    }

    if (opts?.admin) {
      const [member] = await db
        .select()
        .from(teamMember)
        .where(and(eq(teamMember.userId, userId), eq(teamMember.tenantId, tenantRow.id)))
        .limit(1);
      const role = isTeamRole(member?.role) ? member.role : undefined;
      if (!(role && ADMIN_ROLES.includes(role))) {
        return { success: false, message: "You don't have permission" };
      }
    }

    return await handler({ userId, tenantId: tenantRow.id, tenant: tenantRow });
  } catch (error) {
    return handleError(error);
  }
}

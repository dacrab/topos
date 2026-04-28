import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { teamMember } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
});

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) return { error: "Not authenticated", userId: "" };
  return { userId: session.user.id, error: null };
}

export async function requireAdmin() {
  const { userId, error } = await requireAuth();
  if (error) return { error, userId: "", tenantId: "" };
  const t = await getCurrentTenant();
  const [m] = await db
    .select()
    .from(teamMember)
    .where(and(eq(teamMember.userId, userId), eq(teamMember.tenantId, t.id)))
    .limit(1);
  if (!m || !["owner", "admin"].includes(m.role))
    return { error: "You don't have permission", userId: "", tenantId: "" };
  return { userId, tenantId: t.id, error: null };
}

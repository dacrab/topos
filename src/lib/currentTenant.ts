import { eq } from "drizzle-orm";
import { tenant, user } from "@/db/schema";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

/**
 * Ensures there is a Tenant row for the current authenticated user,
 * then returns the Tenant.
 */
export async function getCurrentTenant() {
  const session = await getSession();

  if (!session) {
    // Fallback for build time or unauthenticated access (e.g. demo)
    const existingDemo = await db
      .select()
      .from(tenant)
      .where(eq(tenant.slug, "demo"))
      .limit(1);

    if (existingDemo.length > 0) {
      return existingDemo[0];
    }

    const newDemo = await db
      .insert(tenant)
      .values({
        name: "Demo Brokerage",
        slug: "demo",
        branding: {},
      })
      .returning();

    return newDemo[0];
  }

  const userId = session.user.id;

  // Check if the user already has a tenant assigned
  // Need to fetch user from DB to get tenantId, as it might not be on session object depending on config
  const dbUser = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (dbUser.length > 0 && dbUser[0].tenantId) {
    const existingTenant = await db
      .select()
      .from(tenant)
      .where(eq(tenant.id, dbUser[0].tenantId))
      .limit(1);
    if (existingTenant.length > 0) {
      return existingTenant[0];
    }
  }

  // If no tenant, create a personal tenant for the user
  const slug = `user-${userId}`;
  let userTenant = await db
    .select()
    .from(tenant)
    .where(eq(tenant.slug, slug))
    .limit(1);

  if (userTenant.length === 0) {
    userTenant = await db
      .insert(tenant)
      .values({
        name: session.user.name || "Personal Brokerage",
        slug,
        branding: {},
      })
      .returning();
  }

  // Link user to tenant
  await db
    .update(user)
    .set({ tenantId: userTenant[0].id })
    .where(eq(user.id, userId));

  return userTenant[0];
}

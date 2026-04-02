import { eq } from "drizzle-orm";
import { cache } from "react";
import { tenant, user } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { APP_CONFIG } from "@/lib/config";
import { db } from "@/lib/db";

/**
 * Get or create a tenant for the current user.
 * Falls back to demo tenant for unauthenticated access.
 * Wrapped in React cache() — deduplicated per request across layout + pages.
 * @throws Error if tenant creation fails
 */
export const getCurrentTenant = cache(async () => {
  const session = await getSession();

  if (!session) {
    return getOrCreateTenant(APP_CONFIG.demoTenant.slug, APP_CONFIG.demoTenant.name);
  }

  const userId = session.user.id;

  const [dbUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);

  if (dbUser?.tenantId) {
    const [existingTenant] = await db
      .select()
      .from(tenant)
      .where(eq(tenant.id, dbUser.tenantId))
      .limit(1);
    if (existingTenant) {
      return existingTenant;
    }
  }

  return getOrCreateTenant(
    `user-${userId}`,
    session.user.name ?? APP_CONFIG.defaultTenantName,
    userId,
  );
});

async function getOrCreateTenant(slug: string, name: string, linkUserId?: string) {
  const [existing] = await db.select().from(tenant).where(eq(tenant.slug, slug)).limit(1);

  if (existing) {
    if (linkUserId)
      await db.update(user).set({ tenantId: existing.id }).where(eq(user.id, linkUserId));
    return existing;
  }

  const [created] = await db.insert(tenant).values({ name, slug, branding: {} }).returning();
  if (!created) throw new Error("Failed to create tenant");

  if (linkUserId)
    await db.update(user).set({ tenantId: created.id }).where(eq(user.id, linkUserId));
  return created;
}

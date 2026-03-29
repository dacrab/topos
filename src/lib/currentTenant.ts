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
    return getOrCreateDemoTenant();
  }

  const userId = session.user.id;

  // Check if user already has a tenant
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

  // Create personal tenant for user
  return createPersonalTenant(userId, session.user.name);
});

async function getOrCreateDemoTenant() {
  const { slug, name } = APP_CONFIG.demoTenant;

  const [existing] = await db.select().from(tenant).where(eq(tenant.slug, slug)).limit(1);

  if (existing) return existing;

  const [created] = await db.insert(tenant).values({ name, slug, branding: {} }).returning();

  if (!created) throw new Error("Failed to create demo tenant");
  return created;
}

async function createPersonalTenant(userId: string, userName: string | null) {
  const slug = `user-${userId}`;

  const [existing] = await db.select().from(tenant).where(eq(tenant.slug, slug)).limit(1);

  if (existing) {
    await db.update(user).set({ tenantId: existing.id }).where(eq(user.id, userId));
    return existing;
  }

  const [created] = await db
    .insert(tenant)
    .values({ name: userName || APP_CONFIG.defaultTenantName, slug, branding: {} })
    .returning();

  if (!created) throw new Error("Failed to create tenant");

  await db.update(user).set({ tenantId: created.id }).where(eq(user.id, userId));
  return created;
}

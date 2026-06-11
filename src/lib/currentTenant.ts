import { eq } from "drizzle-orm";
import { cache } from "react";
import { tenant, user } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { APP_CONFIG } from "@/lib/config";
import { db } from "@/lib/db";

export const getCurrentTenant = cache(async () => {
  const session = await getSession();
  if (!session) throw new Error("Authentication required");

  const userId = session.user.id;
  const [dbUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);

  if (dbUser?.tenantId) {
    const [existing] = await db
      .select()
      .from(tenant)
      .where(eq(tenant.id, dbUser.tenantId))
      .limit(1);
    if (existing) return existing;
  }

  const slug = `user-${userId}`;
  const name = session.user.name ?? APP_CONFIG.defaultTenantName;
  const [existing] = await db.select().from(tenant).where(eq(tenant.slug, slug)).limit(1);

  if (existing) {
    await db.update(user).set({ tenantId: existing.id }).where(eq(user.id, userId));
    return existing;
  }

  const [created] = await db.insert(tenant).values({ name, slug, branding: {} }).returning();
  if (!created) throw new Error("Failed to create tenant");
  await db.update(user).set({ tenantId: created.id }).where(eq(user.id, userId));
  return created;
});

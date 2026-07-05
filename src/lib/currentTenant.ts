import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { tenant, user } from "@/db/schema";
import { APP_CONFIG } from "@/lib/config";
import { db } from "@/lib/db";

async function ensureUserExists(id: string): Promise<void> {
  const [existing] = await db.select().from(user).where(eq(user.id, id)).limit(1);
  if (existing) return;

  const clerkUser = await currentUser();
  if (!clerkUser) return;

  const name =
    `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
    (clerkUser.emailAddresses[0]?.emailAddress ?? "").split("@")[0] ||
    "User";
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  await db.insert(user).values({ id, email, name }).onConflictDoNothing({ target: user.id });
}

async function linkUserToTenant(userId: string, tenantId: string): Promise<void> {
  await db.update(user).set({ tenantId }).where(eq(user.id, userId));
}

export const getCurrentTenant = cache(async (userId?: string) => {
  const id = userId ?? (await auth()).userId;
  if (!id) throw new Error("Authentication required");

  await ensureUserExists(id);

  const [existingUser] = await db.select().from(user).where(eq(user.id, id)).limit(1);

  if (existingUser?.tenantId) {
    const [existingTenant] = await db
      .select()
      .from(tenant)
      .where(eq(tenant.id, existingUser.tenantId))
      .limit(1);
    if (existingTenant) return existingTenant;
  }

  const slug = `user-${id}`;
  const [existingTenant] = await db.select().from(tenant).where(eq(tenant.slug, slug)).limit(1);

  if (existingTenant) {
    if (existingUser) await linkUserToTenant(id, existingTenant.id);
    return existingTenant;
  }

  const [created] = await db
    .insert(tenant)
    .values({ name: APP_CONFIG.defaultTenantName, slug, branding: {} })
    .returning();
  if (!created) throw new Error("Failed to create tenant");
  if (existingUser) await linkUserToTenant(id, created.id);
  return created;
});

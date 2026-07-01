import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { tenant, user } from "@/db/schema";
import { APP_CONFIG } from "@/lib/config";
import { db } from "@/lib/db";

export const getCurrentTenant = cache(async (userId?: string) => {
  const id = userId ?? (await auth()).userId;
  if (!id) throw new Error("Authentication required");

  const [dbUser] = await db.select().from(user).where(eq(user.id, id)).limit(1);

  if (!dbUser) {
    const clerkUser = await currentUser();
    if (clerkUser) {
      const name =
        `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
        (clerkUser.emailAddresses[0]?.emailAddress ?? "").split("@")[0] ||
        "User";
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
      await db.insert(user).values({ id, email, name }).onConflictDoNothing({ target: user.id });
    }
  }

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
  const name = APP_CONFIG.defaultTenantName;
  const [existingTenant] = await db.select().from(tenant).where(eq(tenant.slug, slug)).limit(1);

  if (existingTenant) {
    if (existingUser) {
      await db.update(user).set({ tenantId: existingTenant.id }).where(eq(user.id, id));
    }
    return existingTenant;
  }

  const [created] = await db.insert(tenant).values({ name, slug, branding: {} }).returning();
  if (!created) throw new Error("Failed to create tenant");
  if (existingUser) {
    await db.update(user).set({ tenantId: created.id }).where(eq(user.id, id));
  }
  return created;
});

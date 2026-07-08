import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { tenant, user } from "@/db/schema";
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

  throw new Error("No tenant found");
});

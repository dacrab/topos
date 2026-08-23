import { eq } from "drizzle-orm";
import { tenant } from "@/db/schema";
import { db } from "@/lib/db";

// Resolves a tenant by custom domain (exact) or slug. Dotted identifiers are only
// matched against customDomain so a host like "broker.com" can't hijack slug "broker".
export async function getTenant(identifier: string) {
  if (identifier.includes(".")) {
    const [byCustomDomain] = await db
      .select()
      .from(tenant)
      .where(eq(tenant.customDomain, identifier))
      .limit(1);
    return byCustomDomain;
  }

  const [bySlug] = await db.select().from(tenant).where(eq(tenant.slug, identifier)).limit(1);
  return bySlug;
}

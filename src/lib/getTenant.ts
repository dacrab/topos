import { eq, or } from "drizzle-orm";
import { tenant } from "@/db/schema";
import { db } from "@/lib/db";

// Fetch tenant by subdomain (slug) or custom domain
export async function getTenant(hostname: string) {
  // Remove port if present
  const domain = hostname.split(":")[0];
  const slug = domain.split(".")[0];

  const results = await db
    .select()
    .from(tenant)
    .where(or(eq(tenant.customDomain, domain), eq(tenant.slug, slug)))
    .limit(1);

  return results[0];
}

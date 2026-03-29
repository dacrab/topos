import { eq, or } from "drizzle-orm";
import { notFound } from "next/navigation";
import { tenant } from "@/db/schema";
import { db } from "@/lib/db";

export async function getTenant(hostname: string) {
  const domain = hostname.split(":")[0] ?? hostname;
  const slug = domain.split(".")[0] ?? domain;

  const [result] = await db
    .select()
    .from(tenant)
    .where(or(eq(tenant.customDomain, domain), eq(tenant.slug, slug)))
    .limit(1);

  return result;
}

/**
 * Like getTenant but calls notFound() instead of returning undefined.
 * Eliminates the repetitive `if (!tenant) return notFound()` in every [subdomain] page.
 */
export async function getTenantOrNotFound(hostname: string) {
  const result = await getTenant(hostname);
  if (!result) notFound();
  return result;
}

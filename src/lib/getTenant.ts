import { eq, or } from "drizzle-orm";
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

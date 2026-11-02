import { eq } from "drizzle-orm";
import { cache } from "react";
import { tenant } from "@/db/schema";
import { db } from "@/lib/db";

/**
 * Resolves a tenant by custom domain (exact) or slug.
 *
 * Dotted identifiers are only matched against `customDomain`, so a host like
 * "broker.com" can never hijack the slug "broker". Wrapped in `cache` because
 * the layout, page, and metadata for a single request all resolve the same
 * tenant.
 */
export const getTenant = cache(async (rawIdentifier: string) => {
  const identifier = rawIdentifier.trim().toLowerCase();
  if (!identifier) return;

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
});

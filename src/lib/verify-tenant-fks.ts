import { and, eq } from "drizzle-orm";
import { agent, contact, deal, listing } from "@/db/schema";
import { db } from "./db";

/**
 * Verifies that optional FK IDs (listing, contact, agent, deal) belong to the given tenant.
 * Throws if any ID doesn't belong to the tenant.
 */
export async function verifyTenantFKs(
  tenantId: string,
  ids: {
    listingId?: string | null | undefined;
    contactId?: string | null | undefined;
    agentId?: string | null | undefined;
    dealId?: string | null | undefined;
  },
) {
  const checks: Promise<void>[] = [];

  if (ids.listingId) {
    checks.push(
      db
        .select({ id: listing.id })
        .from(listing)
        .where(and(eq(listing.id, ids.listingId), eq(listing.tenantId, tenantId)))
        .limit(1)
        .then((r) => {
          if (!r[0]) throw new Error("Listing not found");
        }),
    );
  }
  if (ids.contactId) {
    checks.push(
      db
        .select({ id: contact.id })
        .from(contact)
        .where(and(eq(contact.id, ids.contactId), eq(contact.tenantId, tenantId)))
        .limit(1)
        .then((r) => {
          if (!r[0]) throw new Error("Contact not found");
        }),
    );
  }
  if (ids.agentId) {
    checks.push(
      db
        .select({ id: agent.id })
        .from(agent)
        .where(and(eq(agent.id, ids.agentId), eq(agent.tenantId, tenantId)))
        .limit(1)
        .then((r) => {
          if (!r[0]) throw new Error("Agent not found");
        }),
    );
  }
  if (ids.dealId) {
    checks.push(
      db
        .select({ id: deal.id })
        .from(deal)
        .where(and(eq(deal.id, ids.dealId), eq(deal.tenantId, tenantId)))
        .limit(1)
        .then((r) => {
          if (!r[0]) throw new Error("Deal not found");
        }),
    );
  }

  await Promise.all(checks);
}

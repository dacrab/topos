import { and, eq } from "drizzle-orm";
import { agent, contact, deal, listing } from "@/db/schema";
import { db } from "./db";

async function verify(
  table: typeof listing | typeof contact | typeof agent | typeof deal,
  id: string | null | undefined,
  tenantId: string,
  label: string,
) {
  if (!id) return;
  const [row] = await db
    .select({ id: table.id })
    .from(table)
    .where(and(eq(table.id, id), eq(table.tenantId, tenantId)))
    .limit(1);
  if (!row) throw new Error(`${label} not found`);
}

export async function verifyTenantFKs(
  tenantId: string,
  ids: {
    listingId?: string | null | undefined;
    contactId?: string | null | undefined;
    agentId?: string | null | undefined;
    dealId?: string | null | undefined;
  },
) {
  await Promise.all([
    verify(listing, ids.listingId, tenantId, "Listing"),
    verify(contact, ids.contactId, tenantId, "Contact"),
    verify(agent, ids.agentId, tenantId, "Agent"),
    verify(deal, ids.dealId, tenantId, "Deal"),
  ]);
}

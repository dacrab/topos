"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { contact, listing } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

export async function archiveListings(ids: string[]) {
  if (!ids.length) return { success: false as const, message: "No listings selected" };
  const tenant = await getCurrentTenant();

  await db
    .update(listing)
    .set({ status: "ARCHIVED", updatedAt: new Date() })
    .where(and(inArray(listing.id, ids), eq(listing.tenantId, tenant.id)));

  revalidatePath("/listings");
  return { success: true as const, count: ids.length };
}

export async function exportContactsCsv() {
  const tenant = await getCurrentTenant();

  const contacts = await db.select().from(contact).where(eq(contact.tenantId, tenant.id));

  const headers = "firstName,lastName,email,phone,type,source,createdAt";
  const rows = contacts.map((c) =>
    [
      c.firstName,
      c.lastName ?? "",
      c.email ?? "",
      c.phone ?? "",
      c.type,
      c.source ?? "",
      c.createdAt.toISOString(),
    ].join(","),
  );

  return { success: true as const, csv: [headers, ...rows].join("\n") };
}

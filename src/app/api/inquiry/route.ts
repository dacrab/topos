import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { activity, agent, contact, listing } from "@/db/schema";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { newLeadAlert } from "@/lib/email-templates";
import { getTenant } from "@/lib/getTenant";
import { dispatchWebhook } from "@/lib/webhook";

const inquirySchema = z.object({
  listingId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().optional(),
  subdomain: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { listingId, name, email, phone, message, subdomain } = parsed.data;

  const tenant = await getTenant(subdomain);
  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const [listingData] = await db.select().from(listing).where(eq(listing.id, listingId)).limit(1);

  const nameParts = name.trim().split(" ");
  const firstName = nameParts[0] ?? name;
  const lastName = nameParts.slice(1).join(" ") || null;

  const [newContact] = await db
    .insert(contact)
    .values({
      firstName,
      lastName,
      email,
      phone: phone || null,
      type: "LEAD",
      source: "website",
      notes: message || null,
      tenantId: tenant.id,
    })
    .returning();

  await db.insert(activity).values({
    type: "inquiry",
    title: `New inquiry on ${listingData?.title ?? "listing"}`,
    description: message || null,
    tenantId: tenant.id,
    listingId,
    contactId: newContact?.id,
  });

  dispatchWebhook(tenant.id, "contact.created", { contactId: newContact?.id, source: "website" });

  // Notify listing agent via email
  if (listingData?.agentId) {
    const [agentData] = await db
      .select()
      .from(agent)
      .where(eq(agent.id, listingData.agentId))
      .limit(1);
    if (agentData?.email) {
      await sendEmail({
        to: agentData.email,
        subject: `New inquiry on ${listingData.title}`,
        html: newLeadAlert(agentData.name, name, email, listingData.title),
      });
    }
  }

  return NextResponse.json({ success: true });
}

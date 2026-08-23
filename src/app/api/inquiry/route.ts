import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { activity, contact, listing, teamMember, user } from "@/db/schema";
import { type ActivityType, logAudit } from "@/lib/activity";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { newLeadAlert } from "@/lib/email-templates";
import { getTenant } from "@/lib/getTenant";
import { createInquiryRateLimiter } from "@/lib/rate-limit";
import { dispatchWebhook } from "@/lib/webhook";

const inquirySchema = z.object({
  listingId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().optional(),
  subdomain: z.string().min(1),
});

const rateLimiter = createInquiryRateLimiter();

function clientIp(request: Request): string {
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function sameOrigin(a: string, b: string): boolean {
  try {
    return new URL(a).host === new URL(b).host;
  } catch {
    return false;
  }
}

function checkOrigin(request: Request): boolean {
  const origin = request.headers.get("origin") || request.headers.get("referer") || "";
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || "",
    process.env.NEXT_PUBLIC_SITE_URL || "",
  ].filter(Boolean);
  if (allowedOrigins.length === 0) return true;
  return allowedOrigins.some((o) => sameOrigin(origin, o));
}

async function resolveListing(tenantId: string, listingId: string) {
  const [row] = await db
    .select()
    .from(listing)
    .where(and(eq(listing.id, listingId), eq(listing.tenantId, tenantId)))
    .limit(1);
  return row ?? null;
}

type InquiryPayload = z.infer<typeof inquirySchema>;

async function createInquiryContact(tenantId: string, data: InquiryPayload) {
  const [firstName, ...rest] = data.name.trim().split(" ");
  const [created] = await db
    .insert(contact)
    .values({
      firstName: firstName || data.name,
      lastName: rest.join(" ") || null,
      email: data.email,
      phone: data.phone || null,
      type: "LEAD",
      source: "website",
      notes: data.message || null,
      tenantId,
    })
    .returning();
  return created ?? null;
}

async function recordActivity(
  tenantId: string,
  listingTitle: string,
  listingId: string,
  contactId: string | null,
  message: string | null,
) {
  await db.insert(activity).values({
    type: "INQUIRY" satisfies ActivityType,
    title: `New inquiry on ${listingTitle}`,
    description: message,
    tenantId,
    listingId,
    contactId,
  });
  await logAudit({ tenantId, action: "CREATE", entity: "contact", entityId: contactId });
}

async function notifyAgent(
  listingData: typeof listing.$inferSelect,
  inquirerName: string,
  email: string,
) {
  if (!listingData.agentId) return;
  const [agent] = await db
    .select({ name: user.name, email: user.email })
    .from(teamMember)
    .leftJoin(user, eq(teamMember.userId, user.id))
    .where(eq(teamMember.id, listingData.agentId))
    .limit(1);
  if (!agent?.email) return;

  await sendEmail({
    to: agent.email,
    subject: `New inquiry on ${listingData.title}`,
    html: newLeadAlert(agent.name ?? "Agent", inquirerName, email, listingData.title),
  });
}

export async function POST(request: Request) {
  if (!checkOrigin(request)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!(await rateLimiter.hit(clientIp(request)))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const tenant = await getTenant(parsed.data.subdomain);
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  const listingData = await resolveListing(tenant.id, parsed.data.listingId);
  if (!listingData) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const newContact = await createInquiryContact(tenant.id, parsed.data);

  await recordActivity(
    tenant.id,
    listingData.title,
    parsed.data.listingId,
    newContact?.id ?? null,
    parsed.data.message || null,
  );
  await dispatchWebhook(tenant.id, "contact.created", {
    contactId: newContact?.id,
    source: "website",
  });
  await notifyAgent(listingData, parsed.data.name, parsed.data.email);

  return NextResponse.json({ success: true });
}

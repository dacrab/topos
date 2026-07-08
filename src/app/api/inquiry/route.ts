import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { activity, contact, listing, teamMember, user } from "@/db/schema";
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

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60_000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

function checkOrigin(request: Request): boolean {
  const origin = request.headers.get("origin") || request.headers.get("referer") || "";
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || "",
    process.env.NEXT_PUBLIC_SITE_URL || "",
  ].filter(Boolean);
  if (allowedOrigins.length === 0) return true;
  return allowedOrigins.some((o) => origin.startsWith(o));
}

export async function POST(request: Request) {
  if (!checkOrigin(request)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

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

  await dispatchWebhook(tenant.id, "contact.created", {
    contactId: newContact?.id,
    source: "website",
  });

  // Notify listing agent via email
  if (listingData?.agentId) {
    const [agentData] = await db
      .select({
        name: user.name,
        email: user.email,
      })
      .from(teamMember)
      .leftJoin(user, eq(teamMember.userId, user.id))
      .where(eq(teamMember.id, listingData.agentId))
      .limit(1);
    if (agentData?.email) {
      await sendEmail({
        to: agentData.email,
        subject: `New inquiry on ${listingData.title}`,
        html: newLeadAlert(agentData.name ?? "Agent", name, email, listingData.title),
      });
    }
  }

  return NextResponse.json({ success: true });
}

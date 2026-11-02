import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { user } from "@/db/schema";
import { db } from "@/lib/db";
import { deriveDisplayName } from "@/lib/utils";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

const clerkUserSchema = z.object({
  id: z.string().min(1),
  email_addresses: z.array(z.object({ email_address: z.string() })).default([]),
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
});

const clerkEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("user.created"), data: clerkUserSchema }),
  z.object({ type: z.literal("user.updated"), data: clerkUserSchema }),
  z.object({ type: z.literal("user.deleted"), data: z.object({ id: z.string() }) }),
]);

type ClerkUser = z.infer<typeof clerkUserSchema>;

// Clerk verifies authenticity, not shape; this is the open envelope every Clerk
// event arrives in (unknown `type`s are acknowledged, not acted on).
const clerkEnvelopeSchema = z.looseObject({ type: z.string() });

type ClerkEnvelope = z.infer<typeof clerkEnvelopeSchema>;

const handledEventTypes = new Set(["user.created", "user.updated", "user.deleted"]);

// email is globally unique; if another user already owns the new address,
// keep their existing record intact and skip the email update for this one.
async function resolveSafeEmail(clerkId: string, email: string): Promise<string> {
  if (!email) return "";
  const [conflict] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  return conflict && conflict.id !== clerkId ? "" : email;
}

async function upsertClerkUser(data: ClerkUser): Promise<void> {
  const clerkId = data.id;

  const rawEmail = data.email_addresses[0]?.email_address ?? "";
  const name = deriveDisplayName({
    firstName: data.first_name,
    lastName: data.last_name,
    email: rawEmail,
  });
  const safeEmail = await resolveSafeEmail(clerkId, rawEmail);

  await db
    .insert(user)
    .values({ id: clerkId, email: safeEmail || `${clerkId}@users.noreply.clerk`, name })
    .onConflictDoUpdate({
      target: user.id,
      set: {
        ...(safeEmail ? { email: safeEmail } : {}),
        name,
        updatedAt: new Date(),
      },
    });
}

async function deleteClerkUser(data: { id: string }): Promise<void> {
  await db.delete(user).where(eq(user.id, data.id));
}

async function handle(req: NextRequest): Promise<NextResponse> {
  if (!webhookSecret) {
    return NextResponse.json({ error: "Service not configured" }, { status: 500 });
  }

  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");
  if (!(svix_id && svix_timestamp && svix_signature)) {
    return NextResponse.json({ error: "missing svix headers" }, { status: 400 });
  }

  let event: ClerkEnvelope;
  try {
    const verified = await verifyWebhook(req, { signingSecret: webhookSecret });
    const envelope = clerkEnvelopeSchema.safeParse(verified);
    if (!envelope.success) {
      return NextResponse.json({ error: "invalid payload" }, { status: 400 });
    }
    event = envelope.data;
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (!handledEventTypes.has(event.type)) {
    // Event types we don't act on are acknowledged (previous behavior).
    return NextResponse.json({ received: true });
  }

  const parsed = clerkEventSchema.safeParse(event);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  switch (parsed.data.type) {
    case "user.created":
    case "user.updated":
      await upsertClerkUser(parsed.data.data);
      break;
    case "user.deleted":
      await deleteClerkUser(parsed.data.data);
      break;
  }

  return NextResponse.json({ received: true });
}

export { handle as POST };

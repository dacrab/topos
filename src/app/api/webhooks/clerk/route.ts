import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { user } from "@/db/schema";
import { db } from "@/lib/db";
import { deriveDisplayName } from "@/lib/utils";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

interface ClerkUser {
  id?: string;
  email_addresses?: Array<{ email_address: string }>;
  first_name?: string;
  last_name?: string;
}

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
  if (!clerkId) return;

  const rawEmail = data.email_addresses?.[0]?.email_address ?? "";
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

async function deleteClerkUser(data: ClerkUser): Promise<void> {
  if (!data.id) return;
  await db.delete(user).where(eq(user.id, data.id));
}

function verifyEvent(
  body: string,
  headers: Record<"svix-id" | "svix-timestamp" | "svix-signature", string>,
): { type: string; data: Record<string, unknown> } {
  const wh = new Webhook(webhookSecret as string);
  const verified = wh.verify(body, headers) as Record<string, unknown>;
  return {
    type: String(verified.type ?? ""),
    data: (verified.data ?? {}) as Record<string, unknown>,
  };
}

async function handle(req: Request): Promise<NextResponse> {
  if (!webhookSecret) {
    return NextResponse.json({ error: "Service not configured" }, { status: 500 });
  }

  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");
  if (!(svix_id && svix_timestamp && svix_signature)) {
    return NextResponse.json({ error: "missing svix headers" }, { status: 400 });
  }

  let event: { type: string; data: Record<string, unknown> };
  try {
    event = verifyEvent(await req.text(), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const data: ClerkUser = { ...event.data };
  switch (event.type) {
    case "user.created":
    case "user.updated":
      await upsertClerkUser(data);
      break;
    case "user.deleted":
      await deleteClerkUser(data);
      break;
  }

  return NextResponse.json({ received: true });
}

export { handle as POST };

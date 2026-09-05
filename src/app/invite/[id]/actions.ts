"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { invitation, teamMember, user } from "@/db/schema";
import { db } from "@/lib/db";
import { checkPlanLimit, planLimitMessage } from "@/lib/plans";
import type { ActionResult } from "@/lib/types";

// Returns an ActionResult on recoverable failure (e.g. plan limit reached);
// never resolves normally otherwise — success paths redirect, so the client
// sees a redirect error instead of a return value.
export async function acceptInvitation(invitationId: string): Promise<ActionResult | undefined> {
  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/invite/${invitationId}`)}`);
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress?.toLowerCase() ?? "";

  const [inv] = await db.select().from(invitation).where(eq(invitation.id, invitationId)).limit(1);
  if (
    inv?.status !== "pending" ||
    inv.expiresAt.getTime() < Date.now() ||
    !email ||
    inv.email.toLowerCase() !== email
  ) {
    redirect(`/invite/${invitationId}?state=invalid`);
  }

  const [existingMember] = await db
    .select()
    .from(teamMember)
    .where(and(eq(teamMember.userId, userId), eq(teamMember.tenantId, inv.tenantId)))
    .limit(1);

  if (!existingMember) {
    // Re-check the member limit here: the plan may have downgraded since the
    // invitation was sent, and accepting converts the invitation into a member.
    const hit = await checkPlanLimit(inv.tenantId, "teamMembers");
    if (hit) return { success: false, message: await planLimitMessage(hit) };

    await db.insert(teamMember).values({
      userId,
      tenantId: inv.tenantId,
      role: inv.role,
    });
    await db
      .update(user)
      .set({ tenantId: inv.tenantId })
      .where(and(eq(user.id, userId), isNull(user.tenantId)));
  }

  await db.update(invitation).set({ status: "accepted" }).where(eq(invitation.id, invitationId));

  revalidatePath("/dashboard");
  revalidatePath("/settings/team");
  redirect("/dashboard");
}

"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { invitation, subscription, teamMember, tenant, user, userSettings } from "@/db/schema";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";
import { getPlan } from "@/lib/plans";
import type { ActionResult, TenantBranding } from "@/lib/types";

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const { userId, error } = await requireAuth();
  if (error) return { success: false, message: error };
  const name = formData.get("name")?.toString().trim();
  if (!name) return { success: false, message: "Name is required" };
  
  await db
    .update(user)
    .set({ name, image: formData.get("image")?.toString().trim() || null, updatedAt: new Date() })
    .where(eq(user.id, userId));
  revalidatePath("/settings");
  return { success: true, message: "Profile updated successfully" };
}

export async function updateNotifications(formData: FormData): Promise<ActionResult> {
  const { userId, error } = await requireAuth();
  if (error) return { success: false, message: error };
  
  const notifications = {
    emailNewLead: formData.get("emailNewLead") === "on",
    emailNewOffer: formData.get("emailNewOffer") === "on",
    emailListingUpdate: formData.get("emailListingUpdate") === "on",
    emailWeeklyDigest: formData.get("emailWeeklyDigest") === "on",
    pushNewLead: formData.get("pushNewLead") === "on",
    pushNewOffer: formData.get("pushNewOffer") === "on",
    pushListingUpdate: formData.get("pushListingUpdate") === "on",
    marketingEmails: formData.get("marketingEmails") === "on",
  };
  
  await db
    .insert(userSettings)
    .values({ userId, notifications })
    .onConflictDoUpdate({
      target: userSettings.userId,
      set: { notifications, updatedAt: new Date() },
    });
  revalidatePath("/settings/notifications");
  return { success: true, message: "Notification preferences saved" };
}

export async function inviteTeamMember(formData: FormData): Promise<ActionResult> {
  const { userId, tenantId, error } = await requireAdmin();
  if (error) return { success: false, message: error };
  const email = formData.get("email")?.toString().trim().toLowerCase();
  if (!email) return { success: false, message: "Email is required" };
  
  const [existingUser] = await db.select().from(user).where(eq(user.email, email)).limit(1);
  if (existingUser) {
    const [existingMember] = await db
      .select()
      .from(teamMember)
      .where(and(eq(teamMember.userId, existingUser.id), eq(teamMember.tenantId, tenantId)))
      .limit(1);
    if (existingMember) return { success: false, message: "User is already a team member" };
  }
  
  const [existingInvite] = await db
    .select()
    .from(invitation)
    .where(
      and(
        eq(invitation.email, email),
        eq(invitation.tenantId, tenantId),
        eq(invitation.status, "pending"),
      ),
    )
    .limit(1);
  if (existingInvite) return { success: false, message: "User already has a pending invitation" };
  
  const [[sub], [memberCountRow]] = await Promise.all([
    db.select().from(subscription).where(eq(subscription.tenantId, tenantId)).limit(1),
    db.select({ count: count() }).from(teamMember).where(eq(teamMember.tenantId, tenantId)),
  ]);
  
  const plan = getPlan(sub?.plan ?? "free");
  const memberLimit = plan.limits.teamMembers;
  const currentCount = memberCountRow?.count ?? 0;
  if (memberLimit !== -1 && currentCount >= memberLimit) {
    return {
      success: false,
      message: `Your ${plan.nameKey} plan allows a maximum of ${memberLimit} team member${memberLimit === 1 ? "" : "s"}. Upgrade to add more.`,
    };
  }
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await db.insert(invitation).values({
    email,
    tenantId,
    role: formData.get("role")?.toString() || "agent",
    invitedBy: userId,
    status: "pending",
    expiresAt,
  });
  revalidatePath("/settings/team");
  return { success: true, message: `Invitation sent to ${email}` };
}

export async function updateMemberRole(formData: FormData): Promise<ActionResult> {
  const { userId, tenantId, error } = await requireAdmin();
  if (error) return { success: false, message: error };
  const memberId = formData.get("memberId")?.toString();
  const newRole = formData.get("role")?.toString();
  if (!memberId || !newRole) return { success: false, message: "Missing required fields" };
  
  const [[callerMember], [targetMember]] = await Promise.all([
    db
      .select()
      .from(teamMember)
      .where(and(eq(teamMember.userId, userId), eq(teamMember.tenantId, tenantId)))
      .limit(1),
    db.select().from(teamMember).where(eq(teamMember.id, memberId)).limit(1),
  ]);
  
  if (targetMember?.role === "owner" && callerMember?.role !== "owner")
    return { success: false, message: "Only owners can modify owner roles" };
  if (newRole === "owner" && callerMember?.role !== "owner")
    return { success: false, message: "Only owners can assign owner role" };
  
  await db
    .update(teamMember)
    .set({ role: newRole, updatedAt: new Date() })
    .where(eq(teamMember.id, memberId));
  revalidatePath("/settings/team");
  return { success: true, message: "Role updated successfully" };
}

export async function removeMember(formData: FormData): Promise<ActionResult> {
  const { error } = await requireAdmin();
  if (error) return { success: false, message: error };
  const memberId = formData.get("memberId")?.toString();
  if (!memberId) return { success: false, message: "Member ID required" };
  
  const [target] = await db.select().from(teamMember).where(eq(teamMember.id, memberId)).limit(1);
  if (target?.role === "owner") return { success: false, message: "Cannot remove the owner" };
  
  await db.delete(teamMember).where(eq(teamMember.id, memberId));
  revalidatePath("/settings/team");
  return { success: true, message: "Team member removed" };
}

export async function cancelInvitation(formData: FormData): Promise<ActionResult> {
  const { error } = await requireAdmin();
  if (error) return { success: false, message: error };
  const invitationId = formData.get("invitationId")?.toString();
  if (!invitationId) return { success: false, message: "Invitation ID required" };
  
  await db.delete(invitation).where(eq(invitation.id, invitationId));
  revalidatePath("/settings/team");
  return { success: true, message: "Invitation cancelled" };
}

export async function changePlan(formData: FormData): Promise<ActionResult> {
  const { error } = await requireAdmin();
  if (error) return { success: false, message: error };
  const currentTenant = await getCurrentTenant();
  const newPlan = formData.get("plan")?.toString();
  if (!newPlan || !["free", "pro", "enterprise"].includes(newPlan))
    return { success: false, message: "Invalid plan selected" };
  
  await db
    .insert(subscription)
    .values({ tenantId: currentTenant.id, plan: newPlan, status: "active" })
    .onConflictDoUpdate({
      target: subscription.tenantId,
      set: { plan: newPlan, updatedAt: new Date() },
    });
  revalidatePath("/settings/billing");
  const label = { free: "Free", pro: "Pro", enterprise: "Enterprise" }[newPlan];
  return { success: true, message: `Switched to ${label} plan` };
}

export async function updateCompany(formData: FormData): Promise<ActionResult> {
  const { error } = await requireAdmin();
  if (error) return { success: false, message: error };
  const currentTenant = await getCurrentTenant();
  const get = (k: string) => formData.get(k)?.toString().trim() || undefined;
  const existingBranding = (currentTenant.branding as TenantBranding | null) ?? {};
  
  await db
    .update(tenant)
    .set({
      name: get("name") || currentTenant.name,
      slug: get("slug") || currentTenant.slug,
      customDomain: get("customDomain") || null,
      branding: {
        ...existingBranding,
        phone: get("phone"),
        email: get("companyEmail"),
        website: get("website"),
        address: get("address"),
        description: get("description"),
        socialFacebook: get("socialFacebook"),
        socialInstagram: get("socialInstagram"),
        socialTwitter: get("socialTwitter"),
        socialLinkedin: get("socialLinkedin"),
      },
      updatedAt: new Date(),
    })
    .where(eq(tenant.id, currentTenant.id));
  revalidatePath("/settings/company");
  return { success: true, message: "Company settings saved" };
}

export async function updateBranding(formData: FormData): Promise<ActionResult> {
  const { error } = await requireAdmin();
  if (error) return { success: false, message: error };
  const currentTenant = await getCurrentTenant();
  const get = (k: string) => formData.get(k)?.toString().trim();
  
  await db
    .update(tenant)
    .set({
      name: get("name") ?? currentTenant.name,
      logoUrl: get("logoUrl") ?? null,
      branding: {
        ...((currentTenant.branding as TenantBranding | null) ?? {}),
        ...(get("primary") && { primary: get("primary") }),
        ...(get("accent") && { accent: get("accent") }),
        ...(get("radius") && { radius: get("radius") }),
      },
      updatedAt: new Date(),
    })
    .where(eq(tenant.id, currentTenant.id));
  revalidatePath("/settings/branding");
  return { success: true, message: "Branding updated successfully" };
}

"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { invitation, subscription, teamMember, tenant, user, userSettings } from "@/db/schema";
import { withAdmin, withAuth } from "@/lib/action-wrapper";
import { db } from "@/lib/db";
import { parseFormData } from "@/lib/form-parser";
import { getPlan } from "@/lib/plans";
import type { ActionResult, TenantBranding } from "@/lib/types";
import {
  changePlanSchema,
  inviteTeamMemberSchema,
  notificationSettingsSchema,
  updateBrandingSchema,
  updateCompanySchema,
  updateMemberRoleSchema,
  updateProfileSchema,
} from "@/lib/validation";

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  return withAuth(async (userId) => {
    const { get } = parseFormData(formData);
    const data = updateProfileSchema.parse({
      name: get("name"),
      image: get("image"),
    });

    await db
      .update(user)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(user.id, userId));
    revalidatePath("/settings");
    return { success: true, message: "Profile updated successfully" };
  }) as Promise<ActionResult>;
}

export async function updateNotifications(formData: FormData): Promise<ActionResult> {
  return withAuth(async (userId) => {
    const { getBool } = parseFormData(formData);

    const data = notificationSettingsSchema.parse({
      emailNewLead: getBool("emailNewLead"),
      emailNewOffer: getBool("emailNewOffer"),
      emailListingUpdate: getBool("emailListingUpdate"),
      emailWeeklyDigest: getBool("emailWeeklyDigest"),
      pushNewLead: getBool("pushNewLead"),
      pushNewOffer: getBool("pushNewOffer"),
      pushListingUpdate: getBool("pushListingUpdate"),
      marketingEmails: getBool("marketingEmails"),
    });

    await db
      .insert(userSettings)
      .values({ userId, notifications: data })
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: { notifications: data, updatedAt: new Date() },
      });
    revalidatePath("/settings/notifications");
    return { success: true, message: "Notification preferences saved" };
  }) as Promise<ActionResult>;
}

export async function inviteTeamMember(formData: FormData): Promise<ActionResult> {
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: sequential validation checks are clearer inline
  return withAdmin(async (userId, tenantId) => {
    const data = inviteTeamMemberSchema.parse({
      email: formData.get("email")?.toString().trim().toLowerCase(),
      role: formData.get("role")?.toString() || "agent",
    });

    const [existingUser] = await db.select().from(user).where(eq(user.email, data.email)).limit(1);
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
          eq(invitation.email, data.email),
          eq(invitation.tenantId, tenantId),
          eq(invitation.status, "pending"),
        ),
      )
      .limit(1);
    if (existingInvite) return { success: false, message: "User already has a pending invitation" };

    // Check plan limits
    const [[sub], [memberCountRow]] = await Promise.all([
      db.select().from(subscription).where(eq(subscription.tenantId, tenantId)).limit(1),
      db.select({ count: count() }).from(teamMember).where(eq(teamMember.tenantId, tenantId)),
    ]);
    const plan = getPlan(sub?.plan ?? "free");
    const memberLimit = plan.limits.teamMembers;
    if (memberLimit !== -1 && (memberCountRow?.count ?? 0) >= memberLimit) {
      return {
        success: false,
        message: `Your ${plan.nameKey} plan allows a maximum of ${memberLimit} team member${memberLimit === 1 ? "" : "s"}. Upgrade to add more.`,
      };
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await db.insert(invitation).values({
      email: data.email,
      tenantId,
      role: data.role,
      invitedBy: userId,
      status: "pending",
      expiresAt,
    });
    revalidatePath("/settings/team");
    return { success: true, message: `Invitation sent to ${data.email}` };
  }) as Promise<ActionResult>;
}

export async function updateMemberRole(formData: FormData): Promise<ActionResult> {
  return withAdmin(async (userId, tenantId) => {
    const { get } = parseFormData(formData);
    const data = updateMemberRoleSchema.parse({
      memberId: get("memberId"),
      role: get("role"),
    });

    const [[callerMember], [targetMember]] = await Promise.all([
      db
        .select()
        .from(teamMember)
        .where(and(eq(teamMember.userId, userId), eq(teamMember.tenantId, tenantId)))
        .limit(1),
      db.select().from(teamMember).where(eq(teamMember.id, data.memberId)).limit(1),
    ]);

    if (targetMember?.role === "owner" && callerMember?.role !== "owner")
      return { success: false, message: "Only owners can modify owner roles" };
    if (data.role === "owner" && callerMember?.role !== "owner")
      return { success: false, message: "Only owners can assign owner role" };

    await db
      .update(teamMember)
      .set({ role: data.role, updatedAt: new Date() })
      .where(eq(teamMember.id, data.memberId));
    revalidatePath("/settings/team");
    return { success: true, message: "Role updated successfully" };
  }) as Promise<ActionResult>;
}

export async function removeMember(formData: FormData): Promise<ActionResult> {
  return withAdmin(async () => {
    const memberId = formData.get("memberId")?.toString();
    if (!memberId) return { success: false, message: "Member ID required" };

    const [target] = await db.select().from(teamMember).where(eq(teamMember.id, memberId)).limit(1);
    if (target?.role === "owner") return { success: false, message: "Cannot remove the owner" };

    await db.delete(teamMember).where(eq(teamMember.id, memberId));
    revalidatePath("/settings/team");
    return { success: true, message: "Team member removed" };
  }) as Promise<ActionResult>;
}

export async function cancelInvitation(formData: FormData): Promise<ActionResult> {
  return withAdmin(async () => {
    const invitationId = formData.get("invitationId")?.toString();
    if (!invitationId) return { success: false, message: "Invitation ID required" };

    await db.delete(invitation).where(eq(invitation.id, invitationId));
    revalidatePath("/settings/team");
    return { success: true, message: "Invitation cancelled" };
  }) as Promise<ActionResult>;
}

export async function changePlan(formData: FormData): Promise<ActionResult> {
  return withAdmin(async (_, tenantId) => {
    const plan = formData.get("plan")?.toString();
    const data = changePlanSchema.parse({ plan });

    await db
      .insert(subscription)
      .values({ tenantId, plan: data.plan, status: "active" })
      .onConflictDoUpdate({
        target: subscription.tenantId,
        set: { plan: data.plan, updatedAt: new Date() },
      });
    revalidatePath("/settings/billing");
    const label = { free: "Free", pro: "Pro", enterprise: "Enterprise" }[data.plan];
    return { success: true, message: `Switched to ${label} plan` };
  }) as Promise<ActionResult>;
}

export async function updateCompany(formData: FormData): Promise<ActionResult> {
  return withAdmin(async (_, tenantId) => {
    const { get } = parseFormData(formData);

    const data = updateCompanySchema.parse({
      name: get("name"),
      slug: get("slug"),
      customDomain: get("customDomain"),
      phone: get("phone"),
      companyEmail: get("companyEmail"),
      website: get("website"),
      address: get("address"),
      description: get("description"),
      socialFacebook: get("socialFacebook"),
      socialInstagram: get("socialInstagram"),
      socialTwitter: get("socialTwitter"),
      socialLinkedin: get("socialLinkedin"),
    });

    const [currentTenant] = await db.select().from(tenant).where(eq(tenant.id, tenantId)).limit(1);
    if (!currentTenant) return { success: false, message: "Tenant not found" };

    const existingBranding = (currentTenant.branding as TenantBranding | null) ?? {};

    await db
      .update(tenant)
      .set({
        name: data.name || currentTenant.name,
        slug: data.slug || currentTenant.slug,
        customDomain: data.customDomain || null,
        branding: {
          ...existingBranding,
          phone: data.phone,
          email: data.companyEmail,
          website: data.website,
          address: data.address,
          description: data.description,
          socialFacebook: data.socialFacebook,
          socialInstagram: data.socialInstagram,
          socialTwitter: data.socialTwitter,
          socialLinkedin: data.socialLinkedin,
        },
        updatedAt: new Date(),
      })
      .where(eq(tenant.id, tenantId));
    revalidatePath("/settings/company");
    return { success: true, message: "Company settings saved" };
  }) as Promise<ActionResult>;
}

export async function updateBranding(formData: FormData): Promise<ActionResult> {
  return withAdmin(async (_, tenantId) => {
    const { get } = parseFormData(formData);

    const data = updateBrandingSchema.parse({
      name: get("name"),
      logoUrl: get("logoUrl"),
      primary: get("primary"),
      accent: get("accent"),
      radius: get("radius"),
    });

    const [currentTenant] = await db.select().from(tenant).where(eq(tenant.id, tenantId)).limit(1);
    if (!currentTenant) return { success: false, message: "Tenant not found" };

    await db
      .update(tenant)
      .set({
        name: data.name ?? currentTenant.name,
        logoUrl: data.logoUrl ?? null,
        branding: {
          ...((currentTenant.branding as TenantBranding | null) ?? {}),
          ...(data.primary && { primary: data.primary }),
          ...(data.accent && { accent: data.accent }),
          ...(data.radius && { radius: data.radius }),
        },
        updatedAt: new Date(),
      })
      .where(eq(tenant.id, tenantId));
    revalidatePath("/settings/branding");
    return { success: true, message: "Branding updated successfully" };
  }) as Promise<ActionResult>;
}

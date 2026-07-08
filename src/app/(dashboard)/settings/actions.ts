"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { invitation, teamMember, tenant, user } from "@/db/schema";
import { withAdmin, withAuth } from "@/lib/action-wrapper";
import { PLAN_IDS } from "@/lib/config";
import { db } from "@/lib/db";
import { parseFormData } from "@/lib/form-parser";
import { getPlan } from "@/lib/plans";
import type { ActionResult } from "@/lib/types";
import {
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

    await db.update(user).set(data).where(eq(user.id, userId));
    revalidatePath("/settings");
    return { success: true, message: "Profile updated successfully" };
  });
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

    await db.update(user).set({ notifications: data }).where(eq(user.id, userId));
    revalidatePath("/settings/notifications");
    return { success: true, message: "Notification preferences saved" };
  });
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
      db.select({ plan: tenant.plan }).from(tenant).where(eq(tenant.id, tenantId)).limit(1),
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
  });
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
      db
        .select({ role: teamMember.role })
        .from(teamMember)
        .where(eq(teamMember.id, data.memberId))
        .limit(1),
    ]);

    if (targetMember?.role === "owner" && callerMember?.role !== "owner")
      return { success: false, message: "Only owners can modify owner roles" };
    if (data.role === "owner" && callerMember?.role !== "owner")
      return { success: false, message: "Only owners can assign owner role" };

    await db.update(teamMember).set({ role: data.role }).where(eq(teamMember.id, data.memberId));
    revalidatePath("/settings/team");
    return { success: true, message: "Role updated successfully" };
  });
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
  });
}

export async function cancelInvitation(formData: FormData): Promise<ActionResult> {
  return withAdmin(async () => {
    const invitationId = formData.get("invitationId")?.toString();
    if (!invitationId) return { success: false, message: "Invitation ID required" };

    await db.delete(invitation).where(eq(invitation.id, invitationId));
    revalidatePath("/settings/team");
    return { success: true, message: "Invitation cancelled" };
  });
}

export async function changePlan(formData: FormData): Promise<ActionResult> {
  return withAdmin(async (_, tenantId) => {
    const plan = formData.get("plan")?.toString();
    if (!plan || !PLAN_IDS.includes(plan as (typeof PLAN_IDS)[number])) {
      return { success: false, message: "Invalid plan" };
    }

    await db.update(tenant).set({ plan }).where(eq(tenant.id, tenantId));
    revalidatePath("/settings/billing");
    const label = { free: "Free", pro: "Pro", enterprise: "Enterprise" }[plan];
    return { success: true, message: `Switched to ${label} plan` };
  });
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

    const [updated] = await db
      .update(tenant)
      .set({
        ...(data.name !== null && { name: data.name }),
        ...(data.slug !== null && { slug: data.slug }),
        customDomain: data.customDomain || null,
        branding: {
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.companyEmail !== undefined && { email: data.companyEmail }),
          ...(data.website !== undefined && { website: data.website }),
          ...(data.address !== undefined && { address: data.address }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.socialFacebook !== undefined && { socialFacebook: data.socialFacebook }),
          ...(data.socialInstagram !== undefined && { socialInstagram: data.socialInstagram }),
          ...(data.socialTwitter !== undefined && { socialTwitter: data.socialTwitter }),
          ...(data.socialLinkedin !== undefined && { socialLinkedin: data.socialLinkedin }),
        },
      })
      .where(eq(tenant.id, tenantId))
      .returning();
    if (!updated) return { success: false, message: "Tenant not found" };
    revalidatePath("/settings/company");
    return { success: true, message: "Company settings saved" };
  });
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

    const [updated] = await db
      .update(tenant)
      .set({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
        branding: {
          ...(data.primary && { primary: data.primary }),
          ...(data.accent && { accent: data.accent }),
          ...(data.radius && { radius: data.radius }),
        },
      })
      .where(eq(tenant.id, tenantId))
      .returning();
    if (!updated) return { success: false, message: "Tenant not found" };
    revalidatePath("/settings/branding");
    return { success: true, message: "Branding updated successfully" };
  });
}

"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { invitation, teamMember, tenant, user } from "@/db/schema";
import { withTenant, withUser } from "@/lib/action-wrapper";
import { appUrl } from "@/lib/config";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { inviteEmailHtml } from "@/lib/email-templates";
import { parseFormData } from "@/lib/form-parser";
import { checkPlanLimit, planLimitMessage } from "@/lib/plans";
import type { ActionResult, TenantBranding } from "@/lib/types";
import {
  inviteTeamMemberSchema,
  notificationSettingsSchema,
  updateBrandingSchema,
  updateCompanySchema,
  updateMemberRoleSchema,
  updateProfileSchema,
  validationError,
} from "@/lib/validation";

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  return withUser(async (userId) => {
    const { get } = parseFormData(formData);
    const parsed = updateProfileSchema.safeParse({
      name: get("name"),
      image: get("image"),
    });
    if (!parsed.success) return validationError(parsed.error);

    await db.update(user).set(parsed.data).where(eq(user.id, userId));
    revalidatePath("/settings");
    return { success: true, message: "Profile updated successfully" };
  });
}

export async function updateNotifications(formData: FormData): Promise<ActionResult> {
  return withUser(async (userId) => {
    const { getBool } = parseFormData(formData);

    const parsed = notificationSettingsSchema.safeParse({
      emailNewLead: getBool("emailNewLead"),
      emailNewOffer: getBool("emailNewOffer"),
      emailListingUpdate: getBool("emailListingUpdate"),
      emailWeeklyDigest: getBool("emailWeeklyDigest"),
      marketingEmails: getBool("marketingEmails"),
    });
    if (!parsed.success) return validationError(parsed.error);

    await db.update(user).set({ notifications: parsed.data }).where(eq(user.id, userId));
    revalidatePath("/settings/notifications");
    return { success: true, message: "Notification preferences saved" };
  });
}

export async function inviteTeamMember(formData: FormData): Promise<ActionResult> {
  return withTenant(
    async ({ userId, tenantId, tenant }) => {
      const raw = {
        email: formData.get("email")?.toString().trim().toLowerCase(),
        role: formData.get("role")?.toString() || "agent",
      };
      const parsed = inviteTeamMemberSchema.safeParse(raw);
      if (!parsed.success) return validationError(parsed.error);
      const data = parsed.data;

      const [existingUser] = await db
        .select()
        .from(user)
        .where(eq(user.email, data.email))
        .limit(1);
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
      if (existingInvite)
        return { success: false, message: "User already has a pending invitation" };

      // Pending invitations reserve seats — count them against the team member limit
      const [pendingInvite] = await db
        .select({ count: count() })
        .from(invitation)
        .where(and(eq(invitation.tenantId, tenantId), eq(invitation.status, "pending")));
      const hit = await checkPlanLimit(tenantId, "teamMembers", pendingInvite?.count ?? 0);
      if (hit) return { success: false, message: await planLimitMessage(hit) };

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      const [created] = await db
        .insert(invitation)
        .values({
          email: data.email,
          tenantId,
          role: data.role,
          invitedBy: userId,
          status: "pending",
          expiresAt,
        })
        .returning();

      if (created) {
        const acceptUrl = `${appUrl()}/invite/${created.id}`;
        await sendEmail({
          to: created.email,
          subject: `You've been invited to join ${tenant.name} on Topos`,
          html: inviteEmailHtml(tenant.name, acceptUrl),
        });
      }

      revalidatePath("/settings/team");
      return { success: true, message: `Invitation sent to ${data.email}` };
    },
    { admin: true },
  );
}

export async function updateMemberRole(formData: FormData): Promise<ActionResult> {
  return withTenant(
    async ({ userId, tenantId }) => {
      const { get } = parseFormData(formData);
      const parsed = updateMemberRoleSchema.safeParse({
        memberId: get("memberId"),
        role: get("role"),
      });
      if (!parsed.success) return validationError(parsed.error);

      const [[callerMember], [targetMember]] = await Promise.all([
        db
          .select()
          .from(teamMember)
          .where(and(eq(teamMember.userId, userId), eq(teamMember.tenantId, tenantId)))
          .limit(1),
        db
          .select({ role: teamMember.role })
          .from(teamMember)
          .where(and(eq(teamMember.id, parsed.data.memberId), eq(teamMember.tenantId, tenantId)))
          .limit(1),
      ]);

      if (!targetMember) return { success: false, message: "Team member not found" };
      if (targetMember.role === "owner" && callerMember?.role !== "owner")
        return { success: false, message: "Only owners can modify owner roles" };
      if (parsed.data.role === "owner" && callerMember?.role !== "owner")
        return { success: false, message: "Only owners can assign owner role" };

      await db
        .update(teamMember)
        .set({ role: parsed.data.role })
        .where(eq(teamMember.id, parsed.data.memberId));
      revalidatePath("/settings/team");
      return { success: true, message: "Role updated successfully" };
    },
    { admin: true },
  );
}

export async function removeMember(formData: FormData): Promise<ActionResult> {
  return withTenant(
    async ({ tenantId }) => {
      const memberId = formData.get("memberId")?.toString();
      if (!memberId) return { success: false, message: "Member ID required" };

      const [target] = await db
        .select()
        .from(teamMember)
        .where(and(eq(teamMember.id, memberId), eq(teamMember.tenantId, tenantId)))
        .limit(1);
      if (!target) return { success: false, message: "Team member not found" };
      if (target.role === "owner") return { success: false, message: "Cannot remove the owner" };

      await db.delete(teamMember).where(eq(teamMember.id, memberId));
      revalidatePath("/settings/team");
      return { success: true, message: "Team member removed" };
    },
    { admin: true },
  );
}

export async function cancelInvitation(formData: FormData): Promise<ActionResult> {
  return withTenant(
    async ({ tenantId }) => {
      const invitationId = formData.get("invitationId")?.toString();
      if (!invitationId) return { success: false, message: "Invitation ID required" };

      await db
        .delete(invitation)
        .where(and(eq(invitation.id, invitationId), eq(invitation.tenantId, tenantId)));
      revalidatePath("/settings/team");
      return { success: true, message: "Invitation cancelled" };
    },
    { admin: true },
  );
}

type CompanyData = z.infer<typeof updateCompanySchema>;

function companyBrandingPatch(data: CompanyData) {
  return {
    ...(data.phone !== undefined && { phone: data.phone }),
    ...(data.companyEmail !== undefined && { email: data.companyEmail }),
    ...(data.website !== undefined && { website: data.website }),
    ...(data.address !== undefined && { address: data.address }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.socialFacebook !== undefined && { socialFacebook: data.socialFacebook }),
    ...(data.socialInstagram !== undefined && { socialInstagram: data.socialInstagram }),
    ...(data.socialTwitter !== undefined && { socialTwitter: data.socialTwitter }),
    ...(data.socialLinkedin !== undefined && { socialLinkedin: data.socialLinkedin }),
  };
}

function companyFormFields(formData: FormData): CompanyData {
  const { get } = parseFormData(formData);
  return {
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
  };
}

export async function updateCompany(formData: FormData): Promise<ActionResult> {
  return withTenant(
    async ({ tenantId }) => {
      const parsed = updateCompanySchema.safeParse(companyFormFields(formData));
      if (!parsed.success) return validationError(parsed.error);
      const data = parsed.data;

      const [current] = await db.select().from(tenant).where(eq(tenant.id, tenantId)).limit(1);
      if (!current) return { success: false, message: "Tenant not found" };
      const currentBranding: TenantBranding = current.branding ?? {};

      const [updated] = await db
        .update(tenant)
        .set({
          ...(typeof data.name === "string" && { name: data.name }),
          ...(typeof data.slug === "string" && { slug: data.slug }),
          customDomain: data.customDomain || null,
          branding: { ...currentBranding, ...companyBrandingPatch(data) },
        })
        .where(eq(tenant.id, tenantId))
        .returning();
      if (!updated) return { success: false, message: "Tenant not found" };
      revalidatePath("/settings/company");
      return { success: true, message: "Company settings saved" };
    },
    { admin: true },
  );
}

export async function updateBranding(formData: FormData): Promise<ActionResult> {
  return withTenant(
    async ({ tenantId }) => {
      const { get } = parseFormData(formData);

      const parsed = updateBrandingSchema.safeParse({
        name: get("name"),
        logoUrl: get("logoUrl"),
        primary: get("primary"),
        darkPrimary: get("darkPrimary"),
        accent: get("accent"),
        darkAccent: get("darkAccent"),
        radius: get("radius"),
      });
      if (!parsed.success) return validationError(parsed.error);
      const data = parsed.data;

      const [current] = await db.select().from(tenant).where(eq(tenant.id, tenantId)).limit(1);
      if (!current) return { success: false, message: "Tenant not found" };
      const currentBranding: TenantBranding = current.branding ?? {};

      const [updated] = await db
        .update(tenant)
        .set({
          ...(data.name !== undefined && { name: data.name }),
          ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
          branding: {
            ...currentBranding,
            ...(data.primary !== undefined && { primary: data.primary }),
            ...(data.darkPrimary !== undefined && { darkPrimary: data.darkPrimary }),
            ...(data.accent !== undefined && { accent: data.accent }),
            ...(data.darkAccent !== undefined && { darkAccent: data.darkAccent }),
            ...(data.radius !== undefined && { radius: data.radius }),
          },
        })
        .where(eq(tenant.id, tenantId))
        .returning();
      if (!updated) return { success: false, message: "Tenant not found" };
      revalidatePath("/settings/branding");
      return { success: true, message: "Branding updated successfully" };
    },
    { admin: true },
  );
}

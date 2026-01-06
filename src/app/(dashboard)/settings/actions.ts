"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { invitation, subscription, teamMember, tenant, user, userSettings } from "@/db/schema";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import type { ActionResult, TenantBranding } from "@/lib/types";

const fail = (message: string): ActionResult => ({ success: false, message });
const ok = (message: string): ActionResult => ({ success: true, message });

async function isAdmin(userId: string, tenantId: string) {
  const [m] = await db
    .select()
    .from(teamMember)
    .where(and(eq(teamMember.userId, userId), eq(teamMember.tenantId, tenantId)))
    .limit(1);
  return m && ["owner", "admin"].includes(m.role);
}

async function withAuth<T>(
  fn: (session: { user: { id: string } }) => Promise<T>,
): Promise<T | ActionResult> {
  const session = await getSession();
  return session ? fn(session) : fail("Not authenticated");
}

async function withAdmin<T>(
  fn: (session: { user: { id: string } }, tenantId: string) => Promise<T>,
): Promise<T | ActionResult> {
  return withAuth(async (session) => {
    const t = await getCurrentTenant();
    return (await isAdmin(session.user.id, t.id))
      ? fn(session, t.id)
      : fail("You don't have permission");
  });
}

// Profile Actions
export async function updateProfile(formData: FormData): Promise<ActionResult> {
  return withAuth(async (session) => {
    const name = formData.get("name")?.toString().trim();
    if (!name) return fail("Name is required");

    try {
      await db
        .update(user)
        .set({
          name,
          image: formData.get("image")?.toString().trim() || null,
          updatedAt: new Date(),
        })
        .where(eq(user.id, session.user.id));
      revalidatePath("/settings");
      return ok("Profile updated successfully");
    } catch {
      return fail("Failed to update profile");
    }
  });
}

// Notification Actions
export async function updateNotifications(formData: FormData): Promise<ActionResult> {
  return withAuth(async (session) => {
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

    try {
      const [existing] = await db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, session.user.id))
        .limit(1);
      if (existing) {
        await db
          .update(userSettings)
          .set({ notifications, updatedAt: new Date() })
          .where(eq(userSettings.userId, session.user.id));
      } else {
        await db.insert(userSettings).values({ userId: session.user.id, notifications });
      }
      revalidatePath("/settings/notifications");
      return ok("Notification preferences saved");
    } catch {
      return fail("Failed to save preferences");
    }
  });
}

// Team Actions
export async function inviteTeamMember(formData: FormData): Promise<ActionResult> {
  return withAdmin(async (session, tenantId) => {
    const email = formData.get("email")?.toString().trim().toLowerCase();
    if (!email) return fail("Email is required");

    try {
      const [existingUser] = await db.select().from(user).where(eq(user.email, email)).limit(1);
      if (existingUser) {
        const [existingMember] = await db
          .select()
          .from(teamMember)
          .where(and(eq(teamMember.userId, existingUser.id), eq(teamMember.tenantId, tenantId)))
          .limit(1);
        if (existingMember) return fail("User is already a team member");
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
      if (existingInvite) return fail("User already has a pending invitation");

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
      await db.insert(invitation).values({
        email,
        tenantId,
        role: formData.get("role")?.toString() || "agent",
        invitedBy: session.user.id,
        status: "pending",
        expiresAt,
      });

      revalidatePath("/settings/team");
      return ok(`Invitation sent to ${email}`);
    } catch {
      return fail("Failed to send invitation");
    }
  });
}

export async function updateMemberRole(formData: FormData): Promise<ActionResult> {
  return withAdmin(async (session, tenantId) => {
    const memberId = formData.get("memberId")?.toString();
    const newRole = formData.get("role")?.toString();
    if (!memberId || !newRole) return fail("Missing required fields");

    const [currentMember] = await db
      .select()
      .from(teamMember)
      .where(and(eq(teamMember.userId, session.user.id), eq(teamMember.tenantId, tenantId)))
      .limit(1);
    const [targetMember] = await db
      .select()
      .from(teamMember)
      .where(eq(teamMember.id, memberId))
      .limit(1);

    if (!currentMember) return fail("You are not a team member");
    if (targetMember?.role === "owner" && currentMember.role !== "owner")
      return fail("Only owners can modify owner roles");
    if (newRole === "owner" && currentMember.role !== "owner")
      return fail("Only owners can assign owner role");

    try {
      await db
        .update(teamMember)
        .set({ role: newRole, updatedAt: new Date() })
        .where(eq(teamMember.id, memberId));
      revalidatePath("/settings/team");
      return ok("Role updated successfully");
    } catch {
      return fail("Failed to update role");
    }
  });
}

export async function removeMember(formData: FormData): Promise<ActionResult> {
  return withAdmin(async () => {
    const memberId = formData.get("memberId")?.toString();
    if (!memberId) return fail("Member ID required");

    const [targetMember] = await db
      .select()
      .from(teamMember)
      .where(eq(teamMember.id, memberId))
      .limit(1);
    if (targetMember?.role === "owner") return fail("Cannot remove the owner");

    try {
      await db.delete(teamMember).where(eq(teamMember.id, memberId));
      revalidatePath("/settings/team");
      return ok("Team member removed");
    } catch {
      return fail("Failed to remove member");
    }
  });
}

export async function cancelInvitation(formData: FormData): Promise<ActionResult> {
  return withAdmin(async () => {
    const invitationId = formData.get("invitationId")?.toString();
    if (!invitationId) return fail("Invitation ID required");

    try {
      await db.delete(invitation).where(eq(invitation.id, invitationId));
      revalidatePath("/settings/team");
      return ok("Invitation cancelled");
    } catch {
      return fail("Failed to cancel invitation");
    }
  });
}

// Billing Actions
export async function changePlan(formData: FormData): Promise<ActionResult> {
  const currentTenant = await getCurrentTenant();
  const newPlan = formData.get("plan")?.toString();
  if (!newPlan || !["free", "pro", "enterprise"].includes(newPlan))
    return fail("Invalid plan selected");

  try {
    const [existing] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.tenantId, currentTenant.id))
      .limit(1);
    if (existing) {
      await db
        .update(subscription)
        .set({ plan: newPlan, updatedAt: new Date() })
        .where(eq(subscription.tenantId, currentTenant.id));
    } else {
      await db.insert(subscription).values({
        tenantId: currentTenant.id,
        plan: newPlan,
        status: "active",
      });
    }
    revalidatePath("/settings/billing");
    return ok(
      `Switched to ${{ free: "Free", pro: "Pro", enterprise: "Enterprise" }[newPlan]} plan`,
    );
  } catch {
    return fail("Failed to change plan");
  }
}

// Company Actions
export async function updateCompany(formData: FormData): Promise<ActionResult> {
  const currentTenant = await getCurrentTenant();
  const get = (k: string) => formData.get(k)?.toString().trim() || undefined;
  const existingBranding = (currentTenant.branding as TenantBranding | null) || {};

  try {
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
    return ok("Company settings saved");
  } catch {
    return fail("Failed to save company settings");
  }
}

// Branding Actions
export async function updateBranding(formData: FormData): Promise<ActionResult> {
  const currentTenant = await getCurrentTenant();
  const get = (k: string) => formData.get(k)?.toString().trim() || "";

  try {
    await db
      .update(tenant)
      .set({
        name: get("name") || currentTenant.name,
        logoUrl: get("logoUrl") || null,
        branding: {
          ...(currentTenant.branding as Record<string, unknown> | null),
          ...(get("primary") ? { primary: get("primary") } : {}),
          ...(get("accent") ? { accent: get("accent") } : {}),
          ...(get("radius") ? { radius: get("radius") } : {}),
        },
      })
      .where(eq(tenant.id, currentTenant.id));
    revalidatePath("/settings/branding");
    return ok("Branding updated successfully");
  } catch {
    return fail("Failed to update branding");
  }
}

"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  invitation,
  subscription,
  teamMember,
  tenant,
  user,
  userSettings,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { getCurrentTenant } from "@/lib/currentTenant";
import { db } from "@/lib/db";

type ActionResult = { success: boolean; message?: string };

// Helper: Get authenticated session or return error
async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return session;
}

// Helper: Check if user has admin/owner role for current tenant
async function checkAdminRole(userId: string, tenantId: string) {
  const [member] = await db
    .select()
    .from(teamMember)
    .where(
      and(eq(teamMember.userId, userId), eq(teamMember.tenantId, tenantId)),
    )
    .limit(1);
  return member && ["owner", "admin"].includes(member.role);
}

// Profile Actions
export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated" };

  const name = formData.get("name")?.toString().trim();
  const image = formData.get("image")?.toString().trim() || null;

  if (!name) {
    return { success: false, message: "Name is required" };
  }

  try {
    await db
      .update(user)
      .set({ name, image, updatedAt: new Date() })
      .where(eq(user.id, session.user.id));

    revalidatePath("/settings");
    return { success: true, message: "Profile updated successfully" };
  } catch {
    return { success: false, message: "Failed to update profile" };
  }
}

// Notification Actions
type NotificationSettings = {
  emailNewLead: boolean;
  emailNewOffer: boolean;
  emailListingUpdate: boolean;
  emailWeeklyDigest: boolean;
  pushNewLead: boolean;
  pushNewOffer: boolean;
  pushListingUpdate: boolean;
  marketingEmails: boolean;
};

export async function updateNotifications(
  formData: FormData,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated" };

  const notifications: NotificationSettings = {
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
        .set({
          notifications,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, session.user.id));
    } else {
      await db.insert(userSettings).values({
        userId: session.user.id,
        notifications,
      });
    }

    revalidatePath("/settings/notifications");
    return { success: true, message: "Notification preferences saved" };
  } catch {
    return { success: false, message: "Failed to save preferences" };
  }
}

// Team Actions
export async function inviteTeamMember(
  formData: FormData,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated" };

  const currentTenant = await getCurrentTenant();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const role = formData.get("role")?.toString() || "agent";

  if (!email) return { success: false, message: "Email is required" };

  const isAdmin = await checkAdminRole(session.user.id, currentTenant.id);
  if (!isAdmin) return { success: false, message: "You don't have permission" };

  try {
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existingUser) {
      const [existingMember] = await db
        .select()
        .from(teamMember)
        .where(
          and(
            eq(teamMember.userId, existingUser.id),
            eq(teamMember.tenantId, currentTenant.id),
          ),
        )
        .limit(1);

      if (existingMember) {
        return { success: false, message: "User is already a team member" };
      }
    }

    const [existingInvite] = await db
      .select()
      .from(invitation)
      .where(
        and(
          eq(invitation.email, email),
          eq(invitation.tenantId, currentTenant.id),
          eq(invitation.status, "pending"),
        ),
      )
      .limit(1);

    if (existingInvite) {
      return {
        success: false,
        message: "User already has a pending invitation",
      };
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.insert(invitation).values({
      email,
      tenantId: currentTenant.id,
      role,
      invitedBy: session.user.id,
      status: "pending",
      expiresAt,
    });

    revalidatePath("/settings/team");
    return { success: true, message: `Invitation sent to ${email}` };
  } catch {
    return { success: false, message: "Failed to send invitation" };
  }
}

export async function updateMemberRole(
  formData: FormData,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated" };

  const currentTenant = await getCurrentTenant();
  const memberId = formData.get("memberId")?.toString();
  const newRole = formData.get("role")?.toString();

  if (!memberId || !newRole) {
    return { success: false, message: "Missing required fields" };
  }

  const isAdmin = await checkAdminRole(session.user.id, currentTenant.id);
  if (!isAdmin) return { success: false, message: "You don't have permission" };

  // Get current user's role for owner-specific checks
  const [currentMember] = await db
    .select()
    .from(teamMember)
    .where(
      and(
        eq(teamMember.userId, session.user.id),
        eq(teamMember.tenantId, currentTenant.id),
      ),
    )
    .limit(1);

  const [targetMember] = await db
    .select()
    .from(teamMember)
    .where(eq(teamMember.id, memberId))
    .limit(1);

  if (targetMember?.role === "owner" && currentMember.role !== "owner") {
    return { success: false, message: "Only owners can modify owner roles" };
  }

  if (newRole === "owner" && currentMember.role !== "owner") {
    return { success: false, message: "Only owners can assign owner role" };
  }

  try {
    await db
      .update(teamMember)
      .set({ role: newRole, updatedAt: new Date() })
      .where(eq(teamMember.id, memberId));

    revalidatePath("/settings/team");
    return { success: true, message: "Role updated successfully" };
  } catch {
    return { success: false, message: "Failed to update role" };
  }
}

export async function removeMember(formData: FormData): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated" };

  const currentTenant = await getCurrentTenant();
  const memberId = formData.get("memberId")?.toString();

  if (!memberId) return { success: false, message: "Member ID required" };

  const isAdmin = await checkAdminRole(session.user.id, currentTenant.id);
  if (!isAdmin) return { success: false, message: "You don't have permission" };

  const [targetMember] = await db
    .select()
    .from(teamMember)
    .where(eq(teamMember.id, memberId))
    .limit(1);

  if (targetMember?.role === "owner") {
    return { success: false, message: "Cannot remove the owner" };
  }

  try {
    await db.delete(teamMember).where(eq(teamMember.id, memberId));
    revalidatePath("/settings/team");
    return { success: true, message: "Team member removed" };
  } catch {
    return { success: false, message: "Failed to remove member" };
  }
}

export async function cancelInvitation(
  formData: FormData,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated" };

  const currentTenant = await getCurrentTenant();
  const invitationId = formData.get("invitationId")?.toString();

  if (!invitationId)
    return { success: false, message: "Invitation ID required" };

  const isAdmin = await checkAdminRole(session.user.id, currentTenant.id);
  if (!isAdmin) return { success: false, message: "You don't have permission" };

  try {
    await db.delete(invitation).where(eq(invitation.id, invitationId));
    revalidatePath("/settings/team");
    return { success: true, message: "Invitation cancelled" };
  } catch {
    return { success: false, message: "Failed to cancel invitation" };
  }
}

// Billing Actions
export async function changePlan(formData: FormData): Promise<ActionResult> {
  const currentTenant = await getCurrentTenant();
  const newPlan = formData.get("plan")?.toString();

  if (!newPlan || !["free", "pro", "enterprise"].includes(newPlan)) {
    return { success: false, message: "Invalid plan selected" };
  }

  try {
    const [existing] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.tenantId, currentTenant.id))
      .limit(1);

    if (existing) {
      await db
        .update(subscription)
        .set({
          plan: newPlan,
          updatedAt: new Date(),
        })
        .where(eq(subscription.tenantId, currentTenant.id));
    } else {
      await db.insert(subscription).values({
        tenantId: currentTenant.id,
        plan: newPlan,
        status: "active",
      });
    }

    revalidatePath("/settings/billing");
    const planNames: Record<string, string> = {
      free: "Free",
      pro: "Pro",
      enterprise: "Enterprise",
    };
    return { success: true, message: `Switched to ${planNames[newPlan]} plan` };
  } catch {
    return { success: false, message: "Failed to change plan" };
  }
}

// Company Actions
type TenantBranding = {
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  description?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialTwitter?: string;
  socialLinkedin?: string;
  [key: string]: unknown;
};

export async function updateCompany(formData: FormData): Promise<ActionResult> {
  const currentTenant = await getCurrentTenant();

  const name = formData.get("name")?.toString().trim() || currentTenant.name;
  const slug = formData.get("slug")?.toString().trim() || currentTenant.slug;
  const customDomain = formData.get("customDomain")?.toString().trim() || null;

  const existingBranding =
    (currentTenant.branding as TenantBranding | null) || {};

  const branding: TenantBranding = {
    ...existingBranding,
    phone: formData.get("phone")?.toString().trim() || undefined,
    email: formData.get("companyEmail")?.toString().trim() || undefined,
    website: formData.get("website")?.toString().trim() || undefined,
    address: formData.get("address")?.toString().trim() || undefined,
    description: formData.get("description")?.toString().trim() || undefined,
    socialFacebook:
      formData.get("socialFacebook")?.toString().trim() || undefined,
    socialInstagram:
      formData.get("socialInstagram")?.toString().trim() || undefined,
    socialTwitter:
      formData.get("socialTwitter")?.toString().trim() || undefined,
    socialLinkedin:
      formData.get("socialLinkedin")?.toString().trim() || undefined,
  };

  try {
    await db
      .update(tenant)
      .set({
        name,
        slug,
        customDomain,
        branding,
        updatedAt: new Date(),
      })
      .where(eq(tenant.id, currentTenant.id));

    revalidatePath("/settings/company");
    return { success: true, message: "Company settings saved" };
  } catch {
    return { success: false, message: "Failed to save company settings" };
  }
}

// Branding Actions
export async function updateBranding(
  formData: FormData,
): Promise<ActionResult> {
  const currentTenant = await getCurrentTenant();

  const name = formData.get("name")?.toString().trim() || currentTenant.name;
  const logoUrl = formData.get("logoUrl")?.toString().trim() || null;
  const primary = formData.get("primary")?.toString().trim() || "";
  const accent = formData.get("accent")?.toString().trim() || "";
  const radius = formData.get("radius")?.toString().trim() || "";

  const branding = {
    ...(currentTenant.branding as Record<string, unknown> | null | undefined),
    ...(primary ? { primary } : {}),
    ...(accent ? { accent } : {}),
    ...(radius ? { radius } : {}),
  };

  try {
    await db
      .update(tenant)
      .set({
        name,
        logoUrl,
        branding,
      })
      .where(eq(tenant.id, currentTenant.id));

    revalidatePath("/settings/branding");
    return { success: true, message: "Branding updated successfully" };
  } catch {
    return { success: false, message: "Failed to update branding" };
  }
}

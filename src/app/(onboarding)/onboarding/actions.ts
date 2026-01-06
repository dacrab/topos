"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { teamMember, tenant, user } from "@/db/schema";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import type { ActionResult, TenantBranding } from "@/lib/types";

type OnboardingData = {
  agencyName: string;
  slug: string;
  phone: string;
  email: string;
  address: string;
  website: string;
};

export async function completeOnboarding(
  data: OnboardingData,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Not authenticated" };
  }

  const userId = session.user.id;

  // Check slug is unique
  const existingSlug = await db
    .select()
    .from(tenant)
    .where(eq(tenant.slug, data.slug))
    .limit(1);

  // Get user's current tenant
  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (existingSlug.length > 0 && existingSlug[0].id !== dbUser?.tenantId) {
    return { success: false, message: "This subdomain is already taken" };
  }

  try {
    const branding: TenantBranding = {
      phone: data.phone || undefined,
      email: data.email || undefined,
      address: data.address || undefined,
      website: data.website || undefined,
    };

    let tenantId = dbUser?.tenantId;

    if (tenantId) {
      // Update existing tenant
      await db
        .update(tenant)
        .set({
          name: data.agencyName,
          slug: data.slug,
          branding,
          onboardingCompleted: true,
          updatedAt: new Date(),
        })
        .where(eq(tenant.id, tenantId));
    } else {
      // Create new tenant
      const [newTenant] = await db
        .insert(tenant)
        .values({
          name: data.agencyName,
          slug: data.slug,
          branding,
          onboardingCompleted: true,
        })
        .returning();

      tenantId = newTenant.id;

      // Link user to tenant
      await db.update(user).set({ tenantId }).where(eq(user.id, userId));
    }

    // Ensure user is a team member with owner role
    const [existingMember] = await db
      .select()
      .from(teamMember)
      .where(eq(teamMember.userId, userId))
      .limit(1);

    if (!existingMember) {
      await db.insert(teamMember).values({
        userId,
        tenantId,
        role: "owner",
      });
    }

    revalidatePath("/dashboard");
    return { success: true, message: "Onboarding completed" };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { success: false, message: "Failed to complete onboarding" };
  }
}

"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { teamMember, tenant, user } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult, TenantBranding } from "@/lib/types";

type OnboardingData = {
  agencyName: string;
  slug: string;
  phone: string;
  email: string;
  address: string;
  website: string;
};

export async function completeOnboarding(data: OnboardingData): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, message: "Not authenticated" };

  const userId = session.user.id;

  const [[existingSlug], [dbUser]] = await Promise.all([
    db.select().from(tenant).where(eq(tenant.slug, data.slug)).limit(1),
    db.select().from(user).where(eq(user.id, userId)).limit(1),
  ]);

  if (existingSlug && existingSlug.id !== dbUser?.tenantId) {
    return { success: false, message: "This subdomain is already taken" };
  }

  const branding: TenantBranding = {};
  if (data.phone) branding.phone = data.phone;
  if (data.email) branding.email = data.email;
  if (data.address) branding.address = data.address;
  if (data.website) branding.website = data.website;

  try {
    let tenantId = dbUser?.tenantId;

    if (!tenantId) {
      const [newTenant] = await db
        .insert(tenant)
        .values({
          name: data.agencyName,
          slug: data.slug,
          branding,
          onboardingCompleted: true,
        })
        .returning();
      if (!newTenant) throw new Error("Failed to create tenant");
      tenantId = newTenant.id;
      await db.update(user).set({ tenantId }).where(eq(user.id, userId));
    } else {
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
    }

    const [existingMember] = await db
      .select()
      .from(teamMember)
      .where(eq(teamMember.userId, userId))
      .limit(1);
    if (!existingMember) {
      await db.insert(teamMember).values({ userId, tenantId, role: "owner" });
    }

    revalidatePath("/dashboard");
    return { success: true, message: "Onboarding completed" };
  } catch (error) {
    console.error("Onboarding error:", error);
    return { success: false, message: "Failed to complete onboarding" };
  }
}

"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { teamMember, tenant, user } from "@/db/schema";
import { withAuth } from "@/lib/action-wrapper";
import { db } from "@/lib/db";
import type { ActionResult, TenantBranding } from "@/lib/types";
import { onboardingSchema } from "@/lib/validation";

type OnboardingData = {
  agencyName: string;
  slug: string;
  phone: string;
  email: string;
  address: string;
  website: string;
};

async function createOrUpdateTenant(
  userId: string,
  tenantId: string | null | undefined,
  validatedData: { agencyName: string; slug: string },
  branding: TenantBranding,
): Promise<string> {
  if (!tenantId) {
    const [newTenant] = await db
      .insert(tenant)
      .values({
        name: validatedData.agencyName,
        slug: validatedData.slug,
        branding,
        onboardingCompleted: true,
      })
      .returning();
    if (!newTenant) throw new Error("Failed to create tenant");
    await db.update(user).set({ tenantId: newTenant.id }).where(eq(user.id, userId));
    return newTenant.id;
  }

  await db
    .update(tenant)
    .set({
      name: validatedData.agencyName,
      slug: validatedData.slug,
      branding,
      onboardingCompleted: true,
      updatedAt: new Date(),
    })
    .where(eq(tenant.id, tenantId));
  return tenantId;
}

async function ensureTeamMember(userId: string, tenantId: string): Promise<void> {
  const [existingMember] = await db
    .select()
    .from(teamMember)
    .where(eq(teamMember.userId, userId))
    .limit(1);
  if (!existingMember) {
    await db.insert(teamMember).values({ userId, tenantId, role: "owner" });
  }
}

export async function completeOnboarding(data: OnboardingData): Promise<ActionResult> {
  return withAuth(async (userId) => {
    const validatedData = onboardingSchema.parse(data);

    const [[existingSlug], [dbUser]] = await Promise.all([
      db.select().from(tenant).where(eq(tenant.slug, validatedData.slug)).limit(1),
      db.select().from(user).where(eq(user.id, userId)).limit(1),
    ]);

    if (existingSlug && existingSlug.id !== dbUser?.tenantId) {
      return { success: false, message: "This subdomain is already taken" };
    }

    const branding: TenantBranding = {
      ...(validatedData.phone && { phone: validatedData.phone }),
      ...(validatedData.email && { email: validatedData.email }),
      ...(validatedData.address && { address: validatedData.address }),
      ...(validatedData.website && { website: validatedData.website }),
    };

    const tenantId = await createOrUpdateTenant(userId, dbUser?.tenantId, validatedData, branding);
    await ensureTeamMember(userId, tenantId);
    revalidatePath("/dashboard");
    return { success: true, message: "Onboarding completed" };
  }) as Promise<ActionResult>;
}

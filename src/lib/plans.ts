import { count, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { listing, teamMember, tenant } from "@/db/schema";
import { db } from "./db";

type PlanId = "free" | "pro" | "enterprise";

export type Plan = {
  id: PlanId;
  nameKey: string;
  price: number;
  descriptionKey: string;
  features: string[];
  limits: { listings: number; teamMembers: number };
  productId?: string | undefined;
  recommended?: boolean | undefined;
};

/**
 * Single plan catalog used everywhere: marketing pages, billing settings, and
 * limit enforcement. Translation keys live in the `Billing` namespace.
 * A limit of `-1` means unlimited.
 */
export const PLANS: readonly Plan[] = [
  {
    id: "free",
    nameKey: "freeName",
    price: 0,
    descriptionKey: "freeDescription",
    features: [
      "freeFeatureListings",
      "freeFeatureAnalytics",
      "freeFeatureSupport",
      "freeFeatureTeam",
    ],
    limits: { listings: 5, teamMembers: 1 },
  },
  {
    id: "pro",
    nameKey: "proName",
    price: 29,
    descriptionKey: "proDescription",
    features: [
      "proFeatureListings",
      "proFeatureAnalytics",
      "proFeatureSupport",
      "proFeatureTeam",
      "proFeatureDomain",
      "proFeatureApi",
    ],
    limits: { listings: -1, teamMembers: 5 },
    productId: process.env.POLAR_PRODUCT_ID_PRO,
    recommended: true,
  },
  {
    id: "enterprise",
    nameKey: "enterpriseName",
    price: 99,
    descriptionKey: "enterpriseDescription",
    features: [
      "enterpriseFeatureEverything",
      "enterpriseFeatureTeam",
      "enterpriseFeatureBranding",
      "enterpriseFeatureSupport",
      "enterpriseFeatureSla",
      "enterpriseFeatureIntegrations",
    ],
    limits: { listings: -1, teamMembers: -1 },
    productId: process.env.POLAR_PRODUCT_ID_ENTERPRISE,
  },
] as const;

const FREE_PLAN = PLANS[0] as Plan;

export function getPlan(id: string | null | undefined): Plan {
  return PLANS.find((plan) => plan.id === id) ?? FREE_PLAN;
}

export type PlanResource = "listings" | "teamMembers";

export type PlanLimitHit = {
  planId: PlanId;
  planNameKey: string;
  limit: number;
  resource: PlanResource;
};

/**
 * Returns limit details when the tenant is over its plan quota, or null when
 * within limits. `extraCount` adds reserved seats (e.g. pending invitations)
 * to the usage count.
 */
export async function checkPlanLimit(
  tenantId: string,
  resource: PlanResource,
  extraCount = 0,
): Promise<PlanLimitHit | null> {
  const [found, usage] = await Promise.all([
    db.select({ plan: tenant.plan }).from(tenant).where(eq(tenant.id, tenantId)).limit(1),
    resource === "listings"
      ? db.select({ count: count() }).from(listing).where(eq(listing.tenantId, tenantId))
      : db.select({ count: count() }).from(teamMember).where(eq(teamMember.tenantId, tenantId)),
  ]);

  const plan = getPlan(found[0]?.plan);
  const limit = resource === "listings" ? plan.limits.listings : plan.limits.teamMembers;
  const used = (usage[0]?.count ?? 0) + extraCount;
  if (limit === -1 || used < limit) return null;

  return { planId: plan.id, planNameKey: plan.nameKey, limit, resource };
}

/** Translates a plan-limit result into a user-facing message. */
export async function planLimitMessage(hit: PlanLimitHit): Promise<string> {
  const t = await getTranslations("Billing");
  return t(hit.resource === "listings" ? "listingLimit" : "memberLimit", {
    plan: t(hit.planNameKey),
    limit: hit.limit,
  });
}

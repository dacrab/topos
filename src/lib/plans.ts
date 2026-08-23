import { count, eq } from "drizzle-orm";
import { listing, teamMember, tenant } from "@/db/schema";
import { POLAR_PRODUCT_IDS } from "./config";
import { db } from "./db";

export type Plan = {
  id: string;
  nameKey: string;
  price: number;
  descriptionKey: string;
  features: string[];
  limits: { listings: number; teamMembers: number };
  productId?: string;
  recommended?: boolean;
};

const FREE_PLAN: Plan = {
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
};

export const PLANS: Plan[] = [
  {
    ...FREE_PLAN,
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
    productId: POLAR_PRODUCT_IDS.pro,
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
    productId: POLAR_PRODUCT_IDS.enterprise,
  },
];

export function getPlan(id: string): Plan {
  return PLANS.find((p) => p.id === id) ?? FREE_PLAN;
}

// Marketing page uses different i18n keys than billing, so separate config
export const MARKETING_PLANS = [
  {
    nameKey: "starter",
    priceKey: "free",
    descKey: "starterDesc",
    features: ["starterF1", "starterF2", "starterF3"],
    featured: false,
  },
  {
    nameKey: "growth",
    priceKey: "growthPrice",
    descKey: "growthDesc",
    features: ["growthF1", "growthF2", "growthF3"],
    featured: true,
  },
  {
    nameKey: "enterprise",
    priceKey: "custom",
    descKey: "enterpriseDesc",
    features: ["enterpriseF1", "enterpriseF2", "enterpriseF3"],
    featured: false,
  },
];

export type PlanResource = "listings" | "teamMembers";

export type PlanLimitHit = {
  planId: string;
  planNameKey: string;
  limit: number;
  resource: PlanResource;
};

// Returns limit details when the tenant is over its plan quota, or null when within limits.
// Callers translate the result (plan name is an i18n key, not display text).
export async function checkPlanLimit(
  tenantId: string,
  resource: PlanResource,
): Promise<PlanLimitHit | null> {
  const [sub, countRow] = await Promise.all([
    db.select({ plan: tenant.plan }).from(tenant).where(eq(tenant.id, tenantId)).limit(1),
    resource === "listings"
      ? db.select({ count: count() }).from(listing).where(eq(listing.tenantId, tenantId))
      : db.select({ count: count() }).from(teamMember).where(eq(teamMember.tenantId, tenantId)),
  ]);

  const plan = getPlan(sub[0]?.plan ?? "free");
  const limit = resource === "listings" ? plan.limits.listings : plan.limits.teamMembers;
  const used = countRow?.[0]?.count ?? 0;
  if (limit === -1 || used < limit) return null;

  return { planId: plan.id, planNameKey: plan.nameKey, limit, resource };
}

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

export const PLANS: Plan[] = [
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
  return PLANS.find((p) => p.id === id) ?? (PLANS[0] as Plan);
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

// Returns a user-facing limit message, or null when the tenant is within plan limits.
export async function checkPlanLimit(
  tenantId: string,
  resource: PlanResource,
): Promise<string | null> {
  const [sub, countRow] = await Promise.all([
    db.select({ plan: tenant.plan }).from(tenant).where(eq(tenant.id, tenantId)).limit(1),
    resource === "listings"
      ? db.select({ count: count() }).from(listing).where(eq(listing.tenantId, tenantId))
      : db.select({ count: count() }).from(teamMember).where(eq(teamMember.tenantId, tenantId)),
  ]);

  const plan = getPlan(sub?.[0]?.plan ?? "free");
  const limit = resource === "listings" ? plan.limits.listings : plan.limits.teamMembers;
  const used = countRow?.[0]?.count ?? 0;
  if (limit === -1 || used < limit) return null;

  const noun = resource === "listings" ? "listing" : "team member";
  return `Your ${plan.nameKey} plan allows a maximum of ${limit} ${noun}${limit === 1 ? "" : "s"}. Upgrade to add more.`;
}

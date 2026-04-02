export const MARKETING_PLANS: {
  nameKey: string;
  priceKey: string;
  descKey: string;
  features: string[];
  featured?: boolean;
}[] = [
  {
    nameKey: "starter",
    priceKey: "free",
    descKey: "starterDesc",
    features: ["starterF1", "starterF2", "starterF3"],
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
  },
];

export const PLANS = [
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
  },
];

export type Plan = (typeof PLANS)[number];

const FREE_PLAN = PLANS[0] as Plan;

export function getPlan(id: string): Plan {
  return PLANS.find((p) => p.id === id) ?? FREE_PLAN;
}

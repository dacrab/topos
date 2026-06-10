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
    productId: "03ccc789-62e7-4ec0-897d-a05d81d576ec",
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
    productId: "5ee17be2-cd2a-43b5-ad67-3defb6961bf6",
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

export type Plan = {
  id: string;
  nameKey: string;
  price: number;
  descriptionKey: string;
  features: string[];
  limits: { listings: number; teamMembers: number };
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

export function getPlan(id: string): Plan {
  return PLANS.find((p) => p.id === id) ?? (PLANS[0] as Plan);
}

// Marketing page uses different i18n keys than billing, so separate config
export const MARKETING_PLANS = [
  {
    nameKey: "starter",
    priceKey: "$0/mo",
    descKey: "starterDesc",
    features: ["starterFeature1", "starterFeature2", "starterFeature3"],
    featured: false,
  },
  {
    nameKey: "growth",
    priceKey: "$29/mo",
    descKey: "growthDesc",
    features: ["growthFeature1", "growthFeature2", "growthFeature3"],
    featured: true,
  },
  {
    nameKey: "scale",
    priceKey: "$99/mo",
    descKey: "scaleDesc",
    features: ["scaleFeature1", "scaleFeature2", "scaleFeature3"],
    featured: false,
  },
];

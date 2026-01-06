export const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "For individuals getting started",
    features: ["Up to 5 listings", "Basic analytics", "Email support", "1 team member"],
    limits: { listings: 5, teamMembers: 1 },
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    description: "For growing real estate businesses",
    features: [
      "Unlimited listings",
      "Advanced analytics",
      "Priority support",
      "5 team members",
      "Custom domain",
      "API access",
    ],
    limits: { listings: -1, teamMembers: 5 },
    recommended: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    description: "For large brokerages and agencies",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "White-label branding",
      "Dedicated support",
      "SLA guarantee",
      "Custom integrations",
    ],
    limits: { listings: -1, teamMembers: -1 },
  },
];

export type Plan = (typeof PLANS)[number];

const FREE_PLAN = PLANS[0] as Plan;

export function getPlan(id: string): Plan {
  return PLANS.find((p) => p.id === id) ?? FREE_PLAN;
}

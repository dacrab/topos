export const APP_CONFIG = {
  name: "Topos",
  tagline: "Modern Real Estate Brokerage Platform",
  domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@example.com",
  demoTenant: { slug: "demo", name: "Demo Brokerage" },
  defaultTenantName: "Personal Brokerage",
} as const;

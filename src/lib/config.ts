/**
 * Application configuration
 * All app-wide settings should be defined here for easy customization
 */

export const APP_CONFIG = {
  // Branding
  name: "Aether",
  tagline: "Modern Real Estate Brokerage Platform",
  
  // Domain configuration (used for multi-tenancy)
  domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000",
  
  // Contact
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@example.com",
  
  // Company info
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Aether Inc.",
  
  // Feature flags
  features: {
    multiTenancy: true,
    customDomains: true,
  },
} as const;

export type AppConfig = typeof APP_CONFIG;

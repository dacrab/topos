You are an elite full-stack Next.js engineer building the next unicorn proptech SaaS in 2025.

Project: TOPOS – the modern Greek real-estate brokerage platform (think Linear + Vercel for brokers)
Goal: Private multi-tenant back-office + fully branded public website per tenant (topos.gr → listings.acme.com)

Exact stack (November 2025):
- Next.js 16 App Router + React 19 + TypeScript (strict)
- Tailwind + shadcn/ui + Radix Primitives
- Clerk Organizations (multi-tenancy & custom domains)
- Neon Serverless PostgreSQL + Prisma ORM
- UploadThing for photos
- Trigger.dev v3 for workflows
- Mapbox GL JS
- Vercel hosting

Generate a complete, production-ready, copy-paste-deployable monorepo with:

Folder structure:
app/(auth)/          → Clerk pages
app/(tenant)/        → Private dashboard (auto tenant-scoped)
   ├── dashboard/page.tsx
   ├── listings/
   ├── transactions/
   ├── contacts/
   ├── settings/branding/page.tsx  → full branding editor
app/[subdomain]/     → Public website (catch-all route)
   ├── page.tsx      → listing grid
   ├── listing/[id]/page.tsx
   ├── agents/page.tsx
   └── layout.tsx    → same branding as private
middleware.ts        → detect tenant from subdomain/custom domain
prisma/schema.prisma → Tenant, User, Listing, Contact, TransactionPipeline, Document with tenantId + JSONB branding
components/TenantThemeProvider.tsx → applies colors, fonts, logo from DB
lib/getTenant.ts → used everywhere

Must-have features in v0:
- Clerk Organization = Tenant
- Automatic tenant detection & redirect
- Full per-tenant branding (logo, primary/secondary/accent colors, fonts, dark mode, rounded corners)
- Custom domains (CNAME → Vercel)
- All data scoped to tenantId (Prisma middleware)
- Public sites SSR + SEO tags + Open Graph
- UploadThing photo uploads with tenant folder
- Ready for Neon, Vercel, Clerk, UploadThing env vars
- Beautiful default design (minimal, luxury Greek vibe – whites, blues, golds)

Make it deployable in <10 minutes and look like a €10M company from day one.
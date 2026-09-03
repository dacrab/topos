# Topos

> *Topos* (τόπος) — Greek for "place" or "location"

Multi-tenant SaaS for real estate agencies. Each agency gets a branded site with listings, agents, and contacts.

## Stack

Next.js • React • TypeScript • Tailwind CSS • Drizzle ORM • Neon Postgres • Clerk • Cloudflare R2

## Setup

```bash
bun install
# Set up secrets (via Doppler — or copy .env.example to .env)
doppler setup
bun run db:push
bun dev
```

## Scripts

```bash
bun dev                # Start dev server
bun run build          # Production build
bun run validate       # Typecheck + lint + knip
bun run test           # Vitest
bun run smoke          # Build + boot prod server + curl key routes (catches runtime-only 500s)
bun run db:generate    # Generate Drizzle migrations from schema
bun run db:studio      # Database UI
bun run db:migrate-r2  # One-time rewrite of legacy presigned R2 URLs (dry-run; add -- --apply to write)
```

## Environment

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_ROOT_DOMAIN="localhost"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cloudflare R2 (public bucket base URL is required — uploads store stable public URLs)
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="..."
R2_PUBLIC_URL="https://..."

# Polar billing
POLAR_ACCESS_TOKEN="..."
POLAR_WEBHOOK_SECRET="..."

# Optional: shared rate limiting for POST /api/inquiry.
# When both are set, the limiter uses Upstash Redis REST; otherwise an in-memory
# per-instance store is used (fail-open to memory if Upstash errors).
UPSTASH_REDIS_REST_URL="https://....upstash.io"
UPSTASH_REDIS_REST_TOKEN="AX..."

# Set to "false" to disable the demo tenant's onboarding skip.
ENABLE_DEMO_ONBOARDING_BYPASS="true"
```

## Tenant routing model

Tenant sites are **path-canonical**: a tenant lives at `/acme` (`/[subdomain]/*`). For convenience, requests to `acme.<NEXT_PUBLIC_ROOT_DOMAIN>` are rewritten by `src/proxy.ts` into `/acme/...`, so subdomain URLs work while all internal links stay path-prefixed. Custom domains resolve when passed through the same `[subdomain]` segment (`getTenant` matches `tenant.customDomain` first, slug second); they can also be served directly by pointing DNS at the platform and relying on the customDomain lookup.

## Architecture notes

- **Auth stack** — resource-level, not path-based. `requireTenant()` for pages/routes (redirects to sign-in with a return URL), `withTenant(handler, { admin? })` for tenant-scoped server actions (returns `ActionResult` on authz failure), `withUser` for pre-tenant actions (profile, onboarding). All in `src/lib/action-wrapper.ts`; `src/proxy.ts` stamps `x-pathname` for the return URL.
- **Invitations** — `inviteTeamMember` creates a pending invite (7-day expiry) and emails an accept link (`/invite/<id>`, requires sign-in and matching email). Accepting inserts the team membership, backfills `user.tenantId` when empty, and marks the invite accepted.
- **Audit & activity** — mutations write rows to `auditLog` (`/activity` page) and `activity` (dashboard feed + notification popover) via `src/lib/activity.ts`.
- **Webhooks** — outbound, HMAC-SHA256-signed per tenant webhook (`X-Webhook-Signature`); dispatched events: `listing.created`, `listing.updated`, `contact.created`, `deal.created`, `appointment.created`.
- **File uploads** — R2 uploads return stable public URLs built from `R2_PUBLIC_URL`. Repositories created before this change may still hold expired presigned URLs; run `bun run db:migrate-r2 -- --apply` once to migrate them.
- **Rate limiting** — inquiry endpoint is origin-checked and rate-limited per IP (Upstash Redis REST when configured, else in-memory with fail-open).

## Features

- Multi-tenant architecture with branded public sites
- Listing management (create, edit, publish)
- Team collaboration (invitations, roles, audit trail)
- Outbound webhooks with signed payloads
- Image/document uploads to Cloudflare R2
- Internationalization (i18n) ready
- Dark mode support

## License

MIT

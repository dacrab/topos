# Topos

> *Topos* (τόπος) — Greek for "place"

Multi-tenant SaaS for real estate agencies. Each agency gets a branded public site with its listings, team, and contacts — plus a shared dashboard for managing the business.

## Stack

Next.js • React • TypeScript • Tailwind CSS • Drizzle ORM • Neon Postgres • Clerk • Cloudflare R2 • Polar

## Getting started

```bash
bun install
doppler setup   # or copy .env.example to .env and fill it in
bun run db:push
bun dev
```

The app runs at `http://localhost:3000`. Sign up, name your agency, and the onboarding flow creates your workspace and public site in one go.

## Scripts

```bash
bun run validate       # typecheck + lint + unused-code check
bun run test           # run the test suite
bun run build          # production build
bun run smoke          # build, boot the server, and verify key routes respond
bun run db:generate    # generate migrations after a schema change
bun run db:studio      # browse the database
```

## Environment

Required:

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_ROOT_DOMAIN="localhost"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="..."
R2_PUBLIC_URL="https://..."
POLAR_ACCESS_TOKEN="..."
POLAR_WEBHOOK_SECRET="..."
```

Optional:

```env
# Shared rate limiting for the public inquiry form (in-memory fallback otherwise)
UPSTASH_REDIS_REST_URL="https://....upstash.io"
UPSTASH_REDIS_REST_TOKEN="AX..."

# Set to "false" to disable the demo tenant's onboarding skip
ENABLE_DEMO_ONBOARDING_BYPASS="true"
```

See `.env.example` for details on each value.

## How it fits together

- **Tenant sites** — every agency lives at `/acme`. Custom domains and `acme.yourdomain.com` URLs are supported via a middleware rewrite.
- **Auth** — sign-in is handled by Clerk; access is checked per resource (page, action, or API route), so protected data stays protected regardless of routing.
- **Billing** — Polar subscriptions with three plans; listing and team-size limits are enforced in the actions that create them.
- **Emails** — invitations and lead alerts via Resend.
- **Webhooks** — tenants can subscribe to listing, contact, deal, and appointment events; payloads are HMAC-signed.

## License

MIT

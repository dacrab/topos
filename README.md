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

`.env.example` is the authoritative list. Doppler config `dev_app` already holds the
working local values, or copy the file to `.env` and fill it in.

The app boots with `DATABASE_URL` and the Clerk keys. Uploads, email, billing, and
Sentry stay disabled until their own variables are set.

## How it fits together

- **Tenant sites** — every agency lives at `/acme`. Custom domains and `acme.yourdomain.com` URLs are supported via a proxy rewrite.
- **Auth** — sign-in is handled by Clerk; access is checked per resource (page, action, or API route), so protected data stays protected regardless of routing.
- **Billing** — Polar subscriptions with three plans; listing and team-size limits are enforced in the actions that create them.
- **Emails** — invitations and lead alerts via Resend.
- **Rate limiting** — the public inquiry form uses a Postgres-backed fixed window, so limits are shared across serverless instances.
- **Webhooks** — tenants can subscribe to listing, contact, deal, and appointment events; payloads are HMAC-signed.

## License

MIT

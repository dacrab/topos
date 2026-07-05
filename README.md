# Topos

> *Topos* (τόπος) — Greek for "place" or "location"

Multi-tenant SaaS for real estate agencies. Each agency gets a branded subdomain with listings, agents, and contacts.

## Stack

Next.js • React • TypeScript • Tailwind CSS • Drizzle ORM • Neon Postgres • Clerk • Cloudflare R2

## Setup

```bash
bun install
cp .env.example .env   # add your credentials
bun run db:push
bun dev
```

## Scripts

```bash
bun dev              # Start dev server
bun run build        # Production build
bun run validate     # Typecheck + lint + knip
bun run db:studio    # Database UI
```

## Environment

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cloudflare R2
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="..."
R2_PUBLIC_URL="https://..."
```

## Features

- Multi-tenant architecture with subdomains
- Listing management (create, edit, publish)
- Team collaboration (invite agents, assign roles)
- Branded public sites per agency
- Image uploads to Cloudflare R2
- Internationalization (i18n) ready
- Dark mode support

## License

MIT

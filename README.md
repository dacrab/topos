# Topos

> *Topos* (τόπος) — Greek for "place" or "location"

Multi-tenant SaaS platform for real estate agencies. Each agency gets a branded subdomain with its own listings, agents, and contacts.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Runtime | Bun |
| Database | Neon (Serverless Postgres) + Drizzle ORM |
| Auth | Better Auth |
| Styling | Tailwind CSS v4 |
| i18n | next-intl |
| Storage | Cloudflare R2 |

## Setup

```bash
bun install
cp .env.example .env   # fill in your values
bun run db:push
bun dev
```

## Scripts

| Command | Description |
|---|---|
| `bun dev` | Dev server (Turbopack) |
| `bun run build` | Production build |
| `bun run validate` | Typecheck + lint + tests + knip |
| `bun run lint` | Biome check |
| `bun run lint:fix` | Biome check + autofix |
| `bun run typecheck` | TypeScript check |
| `bun run test:unit` | Unit + component tests |
| `bun run test:watch` | Watch mode |
| `bun run test:coverage` | Coverage report |
| `bun run test:e2e` | Playwright e2e tests |
| `bun run knip` | Dead code detection |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:push` | Push schema to database |
| `bun run db:studio` | Drizzle Studio |

## Environment Variables

```env
# Database (Neon)
DATABASE_URL="postgresql://..."

# Better Auth
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cloudflare R2 (image storage)
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="..."
R2_PUBLIC_URL="https://..."
```

## Architecture

```
src/
├── app/
│   ├── (auth)/          # Sign in / sign up
│   ├── (dashboard)/     # Tenant dashboard (listings, contacts, settings)
│   ├── (marketing)/     # Public marketing pages
│   ├── (onboarding)/    # First-run setup
│   ├── [subdomain]/     # Public tenant site (branded)
│   └── api/             # Upload + auth routes
├── components/
│   ├── dashboard/       # Header, Sidebar, NotificationPopover
│   ├── listings/        # NewListingDialog, ListingDetailDialog
│   ├── settings/        # All settings forms
│   ├── ui/              # Primitives (Button, Input, Dialog, etc.)
│   └── common/          # Logo
├── db/                  # Drizzle schema + inferred types
├── hooks/               # useFormAction, useImageUpload
├── i18n/                # next-intl config
├── lib/                 # auth, db, config, format, plans, r2, etc.
└── proxy.ts             # Middleware — subdomain routing + i18n
```

# Topos

> *Topos* (τόπος) — Greek for "place" or "location"

Multi-tenant SaaS platform for real estate agencies.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Runtime:** Bun
- **Database:** Neon (Serverless Postgres) + Drizzle ORM
- **Auth:** Better Auth
- **Styling:** Tailwind CSS v4
- **i18n:** next-intl

## Setup

```bash
bun install
cp .env.example .env  # Configure your environment
bun run db:push
bun dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start dev server with Turbopack |
| `bun run build` | Production build |
| `bun run validate` | Type check + lint + unit tests + knip |
| `bun run check` | Alias for `bun run validate` |
| `bun run lint` | Run Biome checks |
| `bun run lint:fix` | Apply safe Biome fixes |
| `bun run format` | Format the codebase with Biome |
| `bun run test` | Alias for `bun run test:unit` |
| `bun run test:unit` | Run unit and component tests |
| `bun run test:coverage` | Run tests with coverage |
| `bun run test:e2e` | Run Playwright end-to-end tests |
| `bun run knip` | Detect unused files, exports, and dependencies |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:push` | Push schema to database |
| `bun run db:studio` | Open Drizzle Studio |

## Environment Variables

```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="..."
R2_PUBLIC_URL="..."
```

## Project Structure

```
src/
├── app/           # Next.js App Router (dashboard, auth, marketing, [subdomain])
├── components/    # Shared UI components
├── db/            # Drizzle schema
├── hooks/         # React hooks (useFormAction, useImageUpload)
├── i18n/          # next-intl routing & request config
├── lib/           # Utilities (auth, db, plans, format, etc.)
└── proxy.ts       # Next.js 16 middleware — subdomain routing & i18n
```

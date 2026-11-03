# Topos

A platform that gives real estate agencies a public website and a private workspace in one place.

**Live demo:** https://topos-lyart.vercel.app

An agency can sign up, name itself, and get a branded site with its listings, agents, and enquiry form — plus a dashboard for the everyday work: contacts, deals, appointments, commissions, and documents. The app is available in Greek and English.

## Features

- A public agency site on its own subdomain or custom domain
- Listings with photos, details, and agent profiles
- An enquiry form that captures new leads
- A dashboard for contacts, deals, appointments, commissions, and documents
- Team invitations with roles and an activity history
- CSV import for contacts
- Free, Pro, and Enterprise plans with different listing and team limits

## Run it locally

You'll need [Bun](https://bun.sh), a Postgres database (Neon is a good fit), and a Clerk account for sign-in.

```bash
bun install
cp .env.example .env     # add DATABASE_URL and the Clerk keys
bun run db:push
bunx next dev
```

Open http://localhost:3000 and create an account.

The repo's `bun run dev` script loads secrets from Doppler. If you're using a plain `.env` file, start Next directly with `bunx next dev`.

## Good to know

- The app starts with just the database and Clerk keys; email, uploads, billing, and error tracking stay off until you add their settings.
- Each agency lives at `/agency-name` and can use a custom domain.
- Plan limits are enforced when adding listings and team members; payments run through Polar.
- The public enquiry form is rate-limited.

## Built with

Next.js, React, Tailwind CSS, Drizzle ORM, Neon Postgres, and Clerk.

## License

MIT

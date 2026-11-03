# Topos

*Topos* (τόπος) is Greek for place — a fitting name for software that gives every estate agency its own corner of the web.

**Live demo:** https://topos-lyart.vercel.app

An agency signs up, picks a name, and comes out with a branded public site plus a private back office. The public side carries listings, agent profiles, and an enquiry form; the dashboard keeps contacts, deals, appointments, commissions, and documents together. Greek and English are both included.

## What's in the box

- Public agency site on a subdomain or custom domain
- Property listings with photos and agent profiles
- Lead-capturing enquiry form
- Dashboard for contacts, deals, appointments, commissions, and documents
- Team invites, roles, and an activity log
- CSV contact import
- Three plans, with limits on listings and team size

## Setting it up

You need Bun, a Postgres database, and Clerk keys. Neon is a good Postgres choice.

```bash
bun install
cp .env.example .env   # DATABASE_URL + Clerk keys
bun run db:push
bunx next dev
```

Visit http://localhost:3000 and sign up.

`bun run dev` pulls secrets from Doppler, so use `bunx next dev` when working from a plain `.env`.

## Worth knowing

- Uploads, email, billing, and error tracking are optional and stay off until configured.
- Each agency sits at `/agency-name`; custom domains work too.
- Listing and team limits come from the plan, and payments go through Polar.
- The public enquiry form is rate-limited.

Built with Next.js, React, Tailwind CSS, Drizzle ORM, Neon, and Clerk. MIT.

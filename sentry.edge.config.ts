import * as Sentry from "@sentry/nextjs";

// Skip init when no DSN is configured (e.g. local dev) to avoid SDK warnings.
const dsn = process.env.SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    tracesSampleRate: 0.1,
    debug: false,
  });
}

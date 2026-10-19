import * as Sentry from "@sentry/nextjs";

// Skip init when no DSN is configured (e.g. local dev) to avoid SDK warnings.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
    debug: false,
  });
}

// Without this, client-side navigations produce no transactions, so errors
// thrown after a soft navigation are never captured.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "@/lib/sentry";

// Skip init when no DSN is configured (e.g. local dev) to avoid SDK warnings.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init(sentryOptions(dsn));
}

// Without this, client-side navigations produce no transactions, so errors
// thrown after a soft navigation are never captured.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

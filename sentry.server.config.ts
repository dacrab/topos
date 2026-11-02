import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "./src/lib/sentry";

// Skip init when no DSN is configured (e.g. local dev) to avoid SDK warnings.
const dsn = process.env.SENTRY_DSN;
if (dsn) {
  Sentry.init(sentryOptions(dsn));
}

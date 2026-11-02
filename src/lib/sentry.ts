/**
 * Init options shared by the server, edge, and browser runtimes.
 *
 * Each runtime keeps its own `Sentry.init` call because the DSN comes from a
 * different env var, but the tuning should only live in one place.
 */
export function sentryOptions(dsn: string) {
  return {
    dsn,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    tracesSampleRate: 0.1,
    debug: false,
  };
}

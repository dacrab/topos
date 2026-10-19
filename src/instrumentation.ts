import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// Next calls this for every error thrown out of a route handler or Server
// Component. Without it those errors never become Sentry events.
export const onRequestError = Sentry.captureRequestError;

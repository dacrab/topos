"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-6">
          <div className="inline-flex items-center bg-destructive/10 border border-destructive/20 px-4 py-2 rounded-full">
            <span className="font-mono text-xs font-medium text-destructive">
              Fatal Error{error.digest ? `: ${error.digest}` : ""}
            </span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight">Something went wrong</h1>
          <p className="text-muted-foreground">
            An unexpected error occurred. Please try again or return home.
          </p>
          <div className="flex gap-3 justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center border border-border px-6 py-3 text-sm font-medium rounded-full hover:bg-secondary transition-colors"
            >
              Go Home
            </a>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

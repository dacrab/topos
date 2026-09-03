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
          <div className="code-pill border-destructive/20 bg-destructive/10">
            <span className="mono-caption text-xs font-medium text-destructive">
              Fatal Error{error.digest ? `: ${error.digest}` : ""}
            </span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="text-muted-foreground">
            An unexpected error occurred. Please try again or return home.
          </p>
          <div className="flex gap-3 justify-center">
            <a href="/" className="btn-outline btn-md">
              Go Home
            </a>
            <button type="button" onClick={reset} className="btn-primary btn-md">
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

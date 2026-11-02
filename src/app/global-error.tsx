"use client";

import * as Sentry from "@sentry/nextjs";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import "./globals.css";

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
      <body className="flex min-h-dvh items-center justify-center bg-background p-8 text-foreground">
        <div className="w-full max-w-md border-t-2 border-foreground/85 pt-8">
          <span className="flex h-10 w-10 items-center justify-center border border-destructive text-destructive">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <h1 className="mt-5 card-title">Something went wrong</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            An unexpected error occurred. Please try again or return home.
          </p>
          <p className="mt-6 border-l-2 border-border pl-3 meta-caps text-muted-foreground">
            Fatal Error{error.digest ? `: ${error.digest}` : ""}
          </p>
          <div className="mt-7 flex gap-2">
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

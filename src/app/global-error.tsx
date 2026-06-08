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
      <body className="min-h-screen bg-[#0a0a0a] text-[#fafafa] flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-6">
          <div className="inline-block border border-red-500/30 bg-red-500/10 px-4 py-2">
            <span className="font-mono text-xs font-bold tracking-widest text-red-400">
              Fatal Error{error.digest ? `: ${error.digest}` : ""}
            </span>
          </div>
          <h1 className="text-5xl font-bold tracking-tighter">Something went wrong</h1>
          <p className="text-[#a1a1aa]">
            An unexpected error occurred. Please try again or return home.
          </p>
          <div className="flex gap-3 justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center border border-[#27272a] px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#27272a]"
            >
              Go Home
            </a>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center bg-[#fafafa] text-[#0a0a0a] px-6 py-3 text-xs font-bold uppercase tracking-widest hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

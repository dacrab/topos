"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type ErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-16 h-16 mx-auto border-2 border-destructive/20 flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight">
          Something went wrong
        </h2>
        <p className="text-muted-foreground text-sm">
          An error occurred while loading this page. Please try again.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = "/dashboard";
            }}
          >
            Go to Dashboard
          </Button>
          <Button onClick={reset}>Try Again</Button>
        </div>
      </div>
    </div>
  );
}

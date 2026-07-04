"use client";

import * as Sentry from "@sentry/nextjs";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ resetError }: { resetError: () => void }) => (
        <div className="flex min-h-[50vh] items-center justify-center p-8">
          <div className="max-w-md text-center space-y-6">
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              something went wrong
            </h1>
            <p className="text-muted-foreground">an unexpected error occurred</p>
            <Button type="button" variant="default" onClick={resetError}>
              try again
            </Button>
          </div>
        </div>
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}

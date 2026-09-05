"use client";

import { useState, useTransition } from "react";
import { acceptInvitation } from "@/app/invite/[id]/actions";
import { Button } from "@/components/ui/button";

type Props = {
  invitationId: string;
  label: string;
};

// redirect() inside a server action rejects the awaited promise with a
// NEXT_REDIRECT digest; the router completes that navigation itself.
function isRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT")
  );
}

export function AcceptInvitationForm({ invitationId, label }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await acceptInvitation(invitationId);
        if (result && !result.success) setError(result.message);
      } catch (err) {
        if (!isRedirect(err)) setError("Something went wrong");
      }
    });
  };

  return (
    <form
      action={() => {
        handleSubmit();
      }}
    >
      {error && <p className="text-sm text-destructive mb-2">{error}</p>}
      <Button type="submit" variant="default" size="lg" className="w-full" disabled={isPending}>
        {label}
      </Button>
    </form>
  );
}

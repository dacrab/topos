"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/types";

/**
 * Hook for handling form actions with loading state and toast notifications.
 * Eliminates repetitive useTransition + toast pattern across forms.
 */
async function runAction(
  action: (fd: FormData) => Promise<ActionResult>,
  fd: FormData,
  onSuccess?: () => void,
) {
  try {
    const result = await action(fd);
    toast[result.success ? "success" : "error"](result.message);
    if (result.success) onSuccess?.();
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Something went wrong");
  }
}

export function useFormAction() {
  const [isPending, startTransition] = useTransition();

  const execute = (action: (fd: FormData) => Promise<ActionResult>, onSuccess?: () => void) => {
    return (fd: FormData) => {
      startTransition(() => runAction(action, fd, onSuccess));
    };
  };

  return { isPending, execute };
}

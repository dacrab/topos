"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/types";

type FormActionOptions = {
  onSuccess?: () => void;
  prepare?: (fd: FormData) => Promise<FormData | undefined> | FormData | undefined;
  errorMessage?: string;
};

async function runAction(
  action: (fd: FormData) => Promise<ActionResult>,
  fd: FormData,
  { onSuccess, prepare, errorMessage }: FormActionOptions,
) {
  try {
    const preparedFormData = (await prepare?.(fd)) ?? fd;
    const result = await action(preparedFormData);
    toast[result.success ? "success" : "error"](result.message);
    if (result.success) onSuccess?.();
  } catch (err) {
    toast.error(errorMessage ?? (err instanceof Error ? err.message : "Something went wrong"));
  }
}

function normalizeOptions(options?: FormActionOptions | (() => void)): FormActionOptions {
  if (typeof options === "function") {
    return { onSuccess: options };
  }

  return options ?? {};
}

export function useFormAction() {
  const [isPending, startTransition] = useTransition();

  const execute = (
    action: (fd: FormData) => Promise<ActionResult>,
    options?: FormActionOptions | (() => void),
  ) => {
    return (fd: FormData) => {
      startTransition(() => runAction(action, fd, normalizeOptions(options)));
    };
  };

  return { isPending, execute };
}

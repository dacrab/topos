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

export function useFormAction() {
  const [isPending, startTransition] = useTransition();

  const execute = (
    action: (fd: FormData) => Promise<ActionResult>,
    options?: FormActionOptions | (() => void),
  ) => {
    const opts = typeof options === "function" ? { onSuccess: options } : (options ?? {});
    return (fd: FormData) => {
      startTransition(() => runAction(action, fd, opts));
    };
  };

  return { isPending, execute };
}

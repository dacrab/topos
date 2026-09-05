import { useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/types";

export function useFormAction(onResult?: (result: ActionResult) => void) {
  const [isPending, startTransition] = useTransition();

  const run =
    (
      serverAction: (formData: FormData) => Promise<ActionResult>,
      options?: {
        // Runs (awaited) before the server action; may mutate FormData
        // (e.g. attach an uploaded image URL). Throwing skips the action.
        beforeSubmit?: (formData: FormData) => Promise<void> | void;
      },
    ) =>
    (formData: FormData) => {
      startTransition(async () => {
        try {
          await options?.beforeSubmit?.(formData);
          const result = await serverAction(formData);
          onResult?.(result);
          toast[result.success ? "success" : "error"](result.message);
        } catch (error) {
          onResult?.({ success: false, message: error instanceof Error ? error.message : "" });
          toast.error("Something went wrong");
        }
      });
    };

  return { run, isPending };
}

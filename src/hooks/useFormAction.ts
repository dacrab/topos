import { useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/types";

export function useFormAction(onResult?: (result: ActionResult) => void) {
  const [isPending, startTransition] = useTransition();

  const run =
    (serverAction: (formData: FormData) => Promise<ActionResult>) => (formData: FormData) => {
      startTransition(async () => {
        const result = await serverAction(formData);
        onResult?.(result);
        toast[result.success ? "success" : "error"](result.message);
      });
    };

  return { run, isPending };
}

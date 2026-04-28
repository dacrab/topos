import { useTransition } from "react";

export function useFormAction<T extends (formData: FormData) => Promise<unknown>>(
  onSuccess?: (result: Awaited<ReturnType<T>>) => void,
) {
  const [isPending, startTransition] = useTransition();

  const execute = (serverAction: T) => (formData: FormData) => {
    startTransition(async () => {
      const result = await serverAction(formData);
      onSuccess?.(result);
    });
  };

  return { execute, isPending };
}

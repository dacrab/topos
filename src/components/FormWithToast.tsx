"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useTransition } from "react";
import { toast } from "sonner";

type FormWithToastProps = {
  children: ReactNode;
  action: (
    formData: FormData,
  ) => Promise<{ success: boolean; message?: string }>;
  successMessage?: string;
  errorMessage?: string;
  className?: string;
  onSuccess?: () => void;
};

export function FormWithToast({
  children,
  action,
  successMessage = "Changes saved successfully",
  errorMessage = "Something went wrong",
  className,
  onSuccess,
}: FormWithToastProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await action(formData);
        if (result.success) {
          toast.success(result.message || successMessage);
          router.refresh();
          onSuccess?.();
        } else {
          toast.error(result.message || errorMessage);
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error(errorMessage);
      }
    });
  }

  return (
    <form action={handleSubmit} className={className}>
      {typeof children === "function"
        ? (children as (isPending: boolean) => ReactNode)(isPending)
        : children}
    </form>
  );
}

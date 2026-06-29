"use client";

import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

type InlineFormProps = {
  trigger: ReactNode;
  onSubmit: (formData: FormData) => Promise<void>;
  onSuccess?: () => void;
  children: ReactNode;
  cancelLabel: string;
  submitLabel: string;
  submittingLabel: string;
};

export function InlineForm({
  trigger,
  onSubmit,
  onSuccess,
  children,
  cancelLabel,
  submitLabel,
  submittingLabel,
}: InlineFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await onSubmit(formData);
        formRef.current?.reset();
        setOpen(false);
        router.refresh();
        onSuccess?.();
      } catch {
        // Error handled by the caller
      }
    });
  }

  if (!open) {
    return (
      <Button type="button" variant="default" onClick={() => setOpen(true)}>
        {trigger}
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="border border-border rounded-2xl p-6 space-y-4"
    >
      {children}
      <div className="flex gap-3">
        <Button type="button" variant="primaryOutline" onClick={() => setOpen(false)}>
          {cancelLabel}
        </Button>
        <Button type="submit" variant="default" disabled={isPending}>
          {isPending ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { FormEvent, ReactNode } from "react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
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
  const t = useTranslations("Common");
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
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("somethingWentWrong"));
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
      className="space-y-4 border-t-2 border-foreground/85 bg-card p-5"
    >
      {children}
      <div className="flex gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          {cancelLabel}
        </Button>
        <Button type="submit" variant="default" disabled={isPending}>
          {isPending ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}

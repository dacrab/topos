"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
};

export function SubmitButton({
  children,
  className = "bg-primary text-primary-foreground px-6 py-3 font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50",
  loadingText,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingText || children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

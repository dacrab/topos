"use client";

import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Dialog = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;
export const DialogTitle = BaseDialog.Title;
export const DialogDescription = BaseDialog.Description;

export function DialogContent({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const t = useTranslations("Common");

  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
      <BaseDialog.Popup
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border border-border bg-card shadow-elevated rounded-xl overflow-hidden transition-[opacity,transform] duration-200 data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
          className,
        )}
      >
        <div className="p-6">{children}</div>
        <BaseDialog.Close className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring transition-all z-10">
          <X className="h-4 w-4" />
          <span className="sr-only">{t("close")}</span>
        </BaseDialog.Close>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

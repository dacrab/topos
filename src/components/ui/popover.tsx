"use client";

import { Popover as BasePopover } from "@base-ui/react/popover";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const Popover = BasePopover.Root;
const PopoverTrigger = BasePopover.Trigger;

function PopoverContent({
  className,
  children,
  align,
  sideOffset,
}: {
  className?: string;
  children?: ReactNode;
  align?: "start" | "center" | "end";
  sideOffset?: number;
}) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner align={align ?? "center"} sideOffset={sideOffset ?? 4}>
        <BasePopover.Popup
          className={cn(
            "z-50 w-72 border border-border/50 bg-popover p-4 text-popover-foreground shadow-elevated rounded-lg outline-none transition-[opacity,transform] duration-150 data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
            className,
          )}
        >
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}

export { Popover, PopoverContent, PopoverTrigger };

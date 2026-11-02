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
            "z-50 w-72 rounded-[2px] border border-border bg-popover text-popover-foreground shadow-elevated outline-none transition-[opacity,transform] duration-150 data-[starting-style]:opacity-0 data-[starting-style]:-translate-y-1 data-[ending-style]:opacity-0 data-[ending-style]:-translate-y-1",
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

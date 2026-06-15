"use client";

import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { cn } from "@/lib/utils";

export function Switch({
  name,
  defaultChecked,
  className,
}: {
  name: string;
  defaultChecked?: boolean | undefined;
  className?: string;
}) {
  return (
    <BaseSwitch.Root
      name={name}
      defaultChecked={defaultChecked}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-input bg-muted data-[checked]:bg-foreground transition-colors",
        className,
      )}
    >
      <BaseSwitch.Thumb className="block h-3.5 w-3.5 rounded-full bg-background shadow-sm translate-x-0.5 data-[checked]:translate-x-[18px] data-[checked]:bg-background transition-transform" />
    </BaseSwitch.Root>
  );
}

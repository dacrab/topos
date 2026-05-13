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
        "relative inline-flex h-5 w-9 shrink-0 items-center border border-input bg-muted data-[checked]:bg-foreground",
        className,
      )}
    >
      <BaseSwitch.Thumb className="block h-3.5 w-3.5 bg-background shadow-sm translate-x-0.5 data-[checked]:translate-x-[18px] data-[checked]:bg-background" />
    </BaseSwitch.Root>
  );
}

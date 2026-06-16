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
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-input bg-muted data-[checked]:bg-primary data-[checked]:border-primary transition-colors cursor-pointer",
        className,
      )}
    >
      <BaseSwitch.Thumb className="block h-4 w-4 rounded-full bg-background shadow-sm translate-x-1 data-[checked]:translate-x-[22px] transition-transform" />
    </BaseSwitch.Root>
  );
}

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
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center border border-input bg-muted transition-colors data-[checked]:border-primary data-[checked]:bg-primary",
        className,
      )}
    >
      <BaseSwitch.Thumb className="block h-3.5 w-3.5 translate-x-[3px] bg-background transition-transform data-[checked]:translate-x-[19px]" />
    </BaseSwitch.Root>
  );
}

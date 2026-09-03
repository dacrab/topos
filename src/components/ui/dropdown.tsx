"use client";

import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type DropdownOption = { value: string; label: string };

/**
 * Form-ready select built on Base UI's Select.
 * Renders a hidden input with `name`, so it submits exactly like a native select.
 */
export function Dropdown({
  name,
  options,
  defaultValue,
  placeholder = "Select...",
  className,
}: {
  name: string;
  options: DropdownOption[];
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <BaseSelect.Root name={name} items={options} defaultValue={defaultValue ?? null}>
      <BaseSelect.Trigger
        className={cn(
          "flex w-full items-center justify-between rounded-lg border border-input bg-card py-2 px-3 text-sm text-left text-foreground transition-all focus:border-primary/50 focus:ring-2 focus:ring-ring/15 focus:outline-none data-[placeholder]:text-muted-foreground/50",
          className,
        )}
      >
        <BaseSelect.Value placeholder={placeholder} />
        <BaseSelect.Icon>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={6} className="z-50 outline-none">
          <BaseSelect.Popup className="max-h-48 overflow-y-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-elevated py-1">
            {options.map((option) => (
              <BaseSelect.Item
                key={option.value}
                value={option.value}
                label={option.label}
                className="flex w-full cursor-default items-center justify-between gap-2 px-3 py-2 text-sm text-foreground outline-none data-[highlighted]:bg-secondary/60 data-[selected]:text-primary data-[selected]:font-medium"
              >
                <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                <Check className="h-3.5 w-3.5 shrink-0 text-primary opacity-0 data-[selected]:opacity-100" />
              </BaseSelect.Item>
            ))}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}

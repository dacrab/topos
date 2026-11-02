"use client";

import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
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
  placeholder,
  className,
}: {
  name: string;
  options: DropdownOption[];
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}) {
  const t = useTranslations("Common");

  return (
    <BaseSelect.Root name={name} items={options} defaultValue={defaultValue ?? null}>
      <BaseSelect.Trigger
        className={cn(
          "flex w-full items-center justify-between rounded-[2px] border border-input bg-card px-3 py-2 text-left text-sm text-foreground transition-colors focus:border-foreground focus:ring-1 focus:ring-foreground/30 focus:outline-none data-[placeholder]:text-muted-foreground/60",
          className,
        )}
      >
        <BaseSelect.Value placeholder={placeholder ?? t("select")} />
        <BaseSelect.Icon>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={6} className="z-50 outline-none">
          <BaseSelect.Popup className="max-h-48 overflow-y-auto rounded-[2px] border border-border bg-popover py-1 text-popover-foreground shadow-elevated">
            {options.map((option) => (
              <BaseSelect.Item
                key={option.value}
                value={option.value}
                label={option.label}
                className="flex w-full cursor-default items-center justify-between gap-2 px-3 py-2 text-sm text-foreground outline-none data-[highlighted]:bg-secondary data-[selected]:font-medium data-[selected]:text-accent"
              >
                <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                <Check className="h-3.5 w-3.5 shrink-0 text-accent opacity-0 data-[selected]:opacity-100" />
              </BaseSelect.Item>
            ))}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}

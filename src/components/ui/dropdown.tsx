"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type DropdownOption = { value: string; label: string };

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
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(
    () => options.find((o) => o.value === defaultValue) ?? null,
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setIsOpen(false);
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((o) => !o);
    }
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <input type="hidden" name={name} value={selected?.value ?? ""} />
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between border border-input bg-background py-2 px-3 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/15 focus:border-primary/50 text-left"
      >
        <span className={selected ? "text-foreground" : "text-muted-foreground/50"}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground shrink-0 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>
      {isOpen && (
        <div
          className="absolute z-50 mt-1.5 w-full border border-border/50 bg-popover shadow-elevated rounded-lg max-h-48 overflow-y-auto py-1"
          role="listbox"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={selected?.value === option.value}
              onClick={() => {
                setSelected(option);
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors",
                selected?.value === option.value && "bg-primary/5 text-primary font-medium",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

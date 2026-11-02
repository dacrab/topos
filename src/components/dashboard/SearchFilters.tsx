"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";

export type FilterConfig = {
  name: string;
  type: "text" | "select" | "number";
  placeholder?: string;
  options?: { value: string; label: string }[];
};

export function SearchFilters({ filters }: { filters: FilterConfig[] }) {
  const t = useTranslations("Common");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function push(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleChange(name: string, value: string, debounce: boolean) {
    if (debounce) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => push(name, value), 300);
    } else {
      push(name, value);
    }
  }

  const hasFilters = filters.some((f) => searchParams.get(f.name));

  return (
    <div className="flex flex-wrap items-center gap-2 border-y border-border bg-card/40 px-2 py-2">
      {filters.map((f) => {
        const current = searchParams.get(f.name) ?? "";
        if (f.type === "select" && f.options) {
          return (
            <Select
              key={f.name}
              defaultValue={current}
              onChange={(e) => handleChange(f.name, e.target.value, false)}
              className="h-9 w-auto min-w-[140px] py-1.5"
            >
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          );
        }
        return (
          <div key={f.name} className="relative min-w-[150px] flex-1 sm:max-w-[220px]">
            {f.type === "text" && (
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            )}
            <Input
              type={f.type === "number" ? "number" : "text"}
              placeholder={f.placeholder}
              defaultValue={current}
              onChange={(e) => handleChange(f.name, e.target.value, f.type === "text")}
              className={f.type === "text" ? "h-9 py-1.5 pl-9" : "h-9 py-1.5"}
            />
          </div>
        );
      })}

      {hasFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-auto text-muted-foreground"
          onClick={() => router.push(pathname)}
        >
          <X className="h-3.5 w-3.5" />
          {t("clearFilters")}
        </Button>
      )}
    </div>
  );
}

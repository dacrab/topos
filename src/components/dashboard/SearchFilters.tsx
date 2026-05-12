"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";
import { Input, Select } from "@/components/ui/input";

export type FilterConfig = {
  name: string;
  type: "text" | "select" | "number";
  placeholder?: string;
  options?: { value: string; label: string }[];
};

export function SearchFilters({ filters }: { filters: FilterConfig[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const push = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(name, value);
      else params.delete(name);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const handleChange = useCallback(
    (name: string, value: string, debounce: boolean) => {
      if (debounce) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => push(name, value), 300);
      } else {
        push(name, value);
      }
    },
    [push],
  );

  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((f) => {
        const current = searchParams.get(f.name) ?? "";
        if (f.type === "select" && f.options) {
          return (
            <Select
              key={f.name}
              defaultValue={current}
              onChange={(e) => handleChange(f.name, e.target.value, false)}
              className="w-auto min-w-[140px]"
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
          <Input
            key={f.name}
            type={f.type === "number" ? "number" : "text"}
            placeholder={f.placeholder}
            defaultValue={current}
            onChange={(e) => handleChange(f.name, e.target.value, f.type === "text")}
            className="w-auto min-w-[140px] max-w-[200px]"
          />
        );
      })}
    </div>
  );
}

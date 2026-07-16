"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const THEME_ORDER = ["light", "dark", "system"] as const;

function ThemeIcon({ theme }: { theme: string }) {
  switch (theme) {
    case "dark":
      return <Moon className="h-4 w-4" />;
    case "system":
      return <Monitor className="h-4 w-4" />;
    default:
      return <Sun className="h-4 w-4" />;
  }
}

export function ThemeControls({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const next = () => {
    const current = (theme ?? "system") as (typeof THEME_ORDER)[number];
    const idx = THEME_ORDER.indexOf(current);
    const nextTheme = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    if (nextTheme) setTheme(nextTheme);
  };

  return (
    <button type="button" onClick={next} className={className} aria-label="Toggle theme">
      {mounted ? <ThemeIcon theme={theme ?? "system"} /> : <Sun className="h-4 w-4" />}
    </button>
  );
}

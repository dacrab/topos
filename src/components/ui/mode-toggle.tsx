"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeControls({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={className}
      aria-label="Toggle theme"
    >
      <div className="relative h-5 w-5">
        <Sun className="absolute inset-0 h-5 w-5 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute inset-0 h-5 w-5 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
      </div>
    </Button>
  );
}

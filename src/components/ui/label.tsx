import type * as React from "react";
import { cn } from "@/lib/utils";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor is passed via props
    <label
      className={cn(
        "text-xs font-bold uppercase tracking-widest text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

import type { ReactNode } from "react";

export function EmptyState({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center text-muted-foreground ${className ?? ""}`}>
      {children}
    </div>
  );
}

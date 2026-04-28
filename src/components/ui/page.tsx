import type { ReactNode } from "react";

export function EmptyState({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center text-muted-foreground ${className ?? ""}`}>
      {children}
    </div>
  );
}

export function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {description && <p className="text-muted-foreground mt-1">{description}</p>}
    </div>
  );
}

export function SettingsPageSection({ 
  title, 
  description, 
  children,
  className 
}: { 
  title: string; 
  description?: string; 
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <SectionHeader title={title} description={description} />
      {children}
    </div>
  );
}


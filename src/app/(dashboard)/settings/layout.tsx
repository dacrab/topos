"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const settingsNav = [
  { href: "/settings", label: "profile", exact: true },
  { href: "/settings/team", label: "team" },
  { href: "/settings/branding", label: "branding" },
  { href: "/settings/company", label: "company" },
  { href: "/settings/notifications", label: "notifications" },
  { href: "/settings/billing", label: "billing" },
  { href: "/settings/pipeline", label: "pipeline" },
  { href: "/settings/api", label: "api" },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const t = useTranslations("Settings");
  const pathname = usePathname();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <nav className="lg:w-52 flex-shrink-0">
          <div className="flex flex-col gap-0.5 p-1 border border-border/60 bg-card rounded-xl shadow-card">
            {settingsNav.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {t(item.label)}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

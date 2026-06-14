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
        <h1 className="text-4xl font-bold tracking-tighter">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <nav className="lg:w-48 flex-shrink-0">
          <div className="border-2 border-foreground bg-card divide-y-2 divide-foreground">
            {settingsNav.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
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

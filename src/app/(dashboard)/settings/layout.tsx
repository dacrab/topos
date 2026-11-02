"use client";

import {
  Bell,
  Building2,
  CreditCard,
  GitBranch,
  KeyRound,
  Palette,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const settingsNav = [
  { href: "/settings", label: "profile", exact: true, icon: UserRound },
  { href: "/settings/team", label: "team", exact: false, icon: Users },
  { href: "/settings/branding", label: "branding", exact: false, icon: Palette },
  { href: "/settings/company", label: "company", exact: false, icon: Building2 },
  { href: "/settings/notifications", label: "notifications", exact: false, icon: Bell },
  { href: "/settings/billing", label: "billing", exact: false, icon: CreditCard },
  { href: "/settings/pipeline", label: "pipeline", exact: false, icon: GitBranch },
  { href: "/settings/api", label: "api", exact: false, icon: KeyRound },
] as const;

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const t = useTranslations("Settings");
  const pathname = usePathname();

  return (
    <div className="space-y-8">
      <div className="border-b-2 border-foreground/85 pb-6">
        <p className="chip-eyebrow mb-4">{t("workspaceSettings")}</p>
        <h1 className="page-title">{t("title")}</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <nav className="lg:w-52 lg:flex-shrink-0" aria-label={t("title")}>
          <div className="flex overflow-x-auto border-y border-border lg:sticky lg:top-6 lg:flex-col lg:border-b-0 lg:border-t-2 lg:border-t-foreground/85">
            {settingsNav.map((item, index) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex shrink-0 items-center gap-2.5 border-l border-border px-3 py-2.5 text-sm transition-colors first:border-l-0 lg:border-l-0 lg:border-b",
                    isActive
                      ? "bg-secondary/60 text-foreground"
                      : "text-muted-foreground hover:bg-secondary/30 hover:text-foreground",
                  )}
                >
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-0 hidden w-[2px] bg-accent lg:block"
                    />
                  )}
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="whitespace-nowrap">{t(item.label)}</span>
                  <span className="ml-auto hidden font-mono text-[0.5625rem] tracking-caps text-muted-foreground/50 lg:inline">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

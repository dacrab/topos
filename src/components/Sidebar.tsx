"use client";

import {
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const tc = useTranslations("Common");
  const t = useTranslations("Dashboard");

  const links = [
    { href: "/dashboard", label: tc("dashboard"), icon: LayoutDashboard },
    { href: "/listings", label: tc("listings"), icon: Home },
    { href: "/transactions", label: tc("transactions"), icon: FileText },
    { href: "/contacts", label: tc("contacts"), icon: Users },
    { href: "/settings", label: tc("settings"), icon: Settings },
  ];

  return (
    <div className="w-64 border-r border-border bg-background flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Logo />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {tc("mainMenu")}
        </div>
        <nav className="flex-1 flex flex-col">
          {links.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-6 py-3.5 border-b border-transparent transition-all duration-200 group",
                  isActive
                    ? "bg-secondary text-foreground font-medium border-border"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Icon
                  size={16}
                  className={cn(
                    "transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <span className="uppercase tracking-widest text-[11px]">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border bg-background">
        <div className="flex items-center gap-3 px-2 py-2 border border-border/50">
          <div className="w-8 h-8 bg-foreground flex items-center justify-center text-xs font-bold text-background">
            AG
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-[10px] font-bold uppercase tracking-wider truncate text-foreground">
              {t("agentUser")}
            </div>
            <div className="text-[10px] text-muted-foreground truncate font-mono">
              ID: 8492-AG
            </div>
          </div>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

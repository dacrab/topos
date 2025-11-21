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
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

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
    <div className="w-64 border-r border-border/60 bg-background flex flex-col shadow-none">
      <div className="h-16 flex items-center px-6 border-b border-border/60">
        <Logo />
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 px-3 py-2">
          {tc("mainMenu")}
        </div>
        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 transition-colors group text-sm",
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon
                size={16}
                className={cn(
                  "transition-colors",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              <span className="uppercase tracking-wide text-xs">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/60 bg-background">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
            AG
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-bold uppercase tracking-wider truncate text-foreground">
              {t("agentUser")}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">
              agent@aether.gr
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

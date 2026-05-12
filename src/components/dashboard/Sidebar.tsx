"use client";

import { createAuthClient } from "better-auth/react";
import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
  Handshake,
  Home,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/common/Logo";
import { cn, getInitials } from "@/lib/utils";

const authClient = createAuthClient({ baseURL: process.env.NEXT_PUBLIC_APP_URL });

const NAV_LINKS = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/listings", labelKey: "listings", icon: Home },
  { href: "/deals", labelKey: "deals", icon: Handshake },
  { href: "/contacts", labelKey: "contacts", icon: Users },
  { href: "/commissions", labelKey: "commissions", icon: DollarSign },
  { href: "/documents", labelKey: "documents", icon: FileText },
  { href: "/appointments", labelKey: "appointments", icon: Calendar },
  { href: "/activity", labelKey: "activity", icon: Activity },
  { href: "/settings", labelKey: "settings", icon: Settings },
] as const;

export function Sidebar({ user }: { user: { name?: string | null; email: string } }) {
  const tc = useTranslations("Common");
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  const toggle = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  const handleLogout = async () => {
    setLoading(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success(tc("signedOutSuccess"));
          router.push("/sign-in");
        },
        onError: () => {
          setLoading(false);
          toast.error(tc("signOutFailed"));
        },
      },
    });
  };

  const initials = getInitials(user.name, user.email);

  return (
    <div
      className={cn(
        "border-r border-border bg-background flex flex-col h-full transition-all duration-200",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!isCollapsed && <Logo />}
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "p-2 hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground",
            isCollapsed && "mx-auto",
          )}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 flex flex-col mt-2">
        {NAV_LINKS.map(({ href, labelKey, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={isCollapsed ? tc(labelKey) : undefined}
              className={cn(
                "flex items-center transition-colors group",
                isCollapsed ? "justify-center px-2 py-3.5" : "gap-3 px-6 py-3.5",
                isActive
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Icon size={isCollapsed ? 20 : 16} className="shrink-0" />
              {!isCollapsed && (
                <span className="uppercase tracking-widest text-[11px]">{tc(labelKey)}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="avatar-sm">{initials}</div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              title={tc("logOut")}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 disabled:opacity-50"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2 py-2 border border-border/50">
            <div className="avatar-sm">{initials}</div>
            <div className="flex-1 overflow-hidden">
              <div className="text-[10px] font-bold uppercase tracking-wider truncate">
                {user.name || user.email}
              </div>
              <div className="text-[10px] text-muted-foreground truncate font-mono">
                {user.email}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              title={tc("logOut")}
              className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

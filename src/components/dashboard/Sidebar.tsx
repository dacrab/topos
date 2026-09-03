"use client";

import { useClerk, useUser } from "@clerk/nextjs";
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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { cn, getInitials } from "@/lib/utils";

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

export function Sidebar() {
  const tc = useTranslations("Common");
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut } = useClerk();
  const { user } = useUser();

  useEffect(() => {
    setIsCollapsed(localStorage.getItem("sidebar-collapsed") === "true");
  }, []);

  const toggle = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      toast.success(tc("signedOutSuccess"));
      router.push("/sign-in");
    } catch {
      toast.error(tc("signOutFailed"));
    } finally {
      setLoading(false);
    }
  };

  const initials = getInitials(user?.fullName, user?.primaryEmailAddress?.emailAddress ?? "");

  return (
    <div
      className={cn(
        "border-r border-sidebar-border bg-sidebar flex flex-col h-full transition-all duration-200 relative",
        isCollapsed ? "w-[64px]" : "w-60",
      )}
    >
      <div className="h-14 flex items-center justify-between px-3 border-b border-sidebar-border">
        {!isCollapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2 px-1">
            <Logo compact showText={false} />
            <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
              Topos
            </span>
          </Link>
        ) : (
          <span className="w-full" />
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggle}
          className={cn(
            "text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            isCollapsed && "mx-auto",
          )}
          aria-expanded={!isCollapsed}
          aria-controls="sidebar-nav"
          aria-label={isCollapsed ? tc("expandSidebar") : tc("collapseSidebar")}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      <nav
        className="flex-1 flex flex-col py-4 gap-0.5 px-2 overflow-y-auto"
        id="sidebar-nav"
        aria-label={tc("sidebarNavigation")}
      >
        {NAV_LINKS.map(({ href, labelKey, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          const link = (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center rounded-lg transition-all",
                isCollapsed ? "justify-center py-2.5 px-0" : "gap-3 px-3 py-2",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-sidebar-accent-foreground"
                />
              )}
              <Icon size={isCollapsed ? 19 : 16} className="shrink-0" />
              {!isCollapsed && <span className="text-sm">{tc(labelKey)}</span>}
            </Link>
          );
          return isCollapsed ? (
            <Tooltip key={href} label={tc(labelKey)}>
              {link}
            </Tooltip>
          ) : (
            link
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="avatar-sm">{initials}</div>
            <Tooltip label={tc("logOut")}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                disabled={loading}
                aria-label={tc("logOut")}
                className="text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <LogOut size={14} />
              </Button>
            </Tooltip>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-sidebar-accent/50">
            <div className="avatar-sm">{initials}</div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.fullName || user?.primaryEmailAddress?.emailAddress}
              </div>
              <div className="text-xs text-sidebar-foreground/40 truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </div>
            </div>
            <Tooltip label={tc("logOut")}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                disabled={loading}
                aria-label={tc("logOut")}
                className="text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
              >
                <LogOut size={14} />
              </Button>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}

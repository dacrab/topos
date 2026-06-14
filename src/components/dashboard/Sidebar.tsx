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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
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
  const [isCollapsed, setIsCollapsed] = useState(false);

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
        "border-r-2 border-foreground bg-background flex flex-col h-full transition-[width] duration-200",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b-2 border-foreground">
        {!isCollapsed && <Logo />}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggle}
          className={cn(isCollapsed && "mx-auto")}
          aria-label={isCollapsed ? tc("expandSidebar") : tc("collapseSidebar")}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      <nav className="flex-1 flex flex-col mt-2">
        {NAV_LINKS.map(({ href, labelKey, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          const link = (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center group",
                isCollapsed ? "justify-center px-2 py-3.5" : "gap-3 px-6 py-3.5",
                isActive
                  ? "bg-brand text-brand-foreground font-medium"
                  : "text-muted-foreground hover:bg-brand/30 hover:text-foreground",
              )}
            >
              <Icon size={isCollapsed ? 20 : 16} className="shrink-0" />
              {!isCollapsed && (
                <span className="uppercase tracking-widest text-[11px]">{tc(labelKey)}</span>
              )}
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

      <div className="p-2 border-t-2 border-foreground">
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
              >
                <LogOut size={14} />
              </Button>
            </Tooltip>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2 py-2 border-2 border-foreground/50">
            <div className="avatar-sm">{initials}</div>
            <div className="flex-1 overflow-hidden">
              <div className="text-[10px] font-bold uppercase tracking-wider truncate">
                {user.name || user.email}
              </div>
              <div className="text-[10px] text-muted-foreground truncate font-mono">
                {user.email}
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

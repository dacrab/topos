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
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard, index: "01" },
  { href: "/listings", labelKey: "listings", icon: Home, index: "02" },
  { href: "/deals", labelKey: "deals", icon: Handshake, index: "03" },
  { href: "/contacts", labelKey: "contacts", icon: Users, index: "04" },
  { href: "/commissions", labelKey: "commissions", icon: DollarSign, index: "05" },
  { href: "/documents", labelKey: "documents", icon: FileText, index: "06" },
  { href: "/appointments", labelKey: "appointments", icon: Calendar, index: "07" },
  { href: "/audit", labelKey: "audit", icon: Activity, index: "08" },
] as const;

const SETTINGS_LINK = {
  href: "/settings",
  labelKey: "settings",
  icon: Settings,
  index: "09",
} as const;

type NavLinkProps = {
  href: string;
  label: string;
  icon: typeof Home;
  index: string;
  active: boolean;
  collapsed: boolean;
  onNavigate?: (() => void) | undefined;
};

function NavLink({ href, label, icon: Icon, index, active, collapsed, onNavigate }: NavLinkProps) {
  const link = (
    <Link
      href={href}
      {...(onNavigate ? { onClick: onNavigate } : {})}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center transition-colors",
        collapsed ? "justify-center py-2.5" : "gap-3 py-2 pl-3 pr-2",
        active
          ? "bg-sidebar-accent text-sidebar-foreground"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
      )}
    >
      {active && <span aria-hidden className="absolute inset-y-0 left-0 w-[2px] bg-accent" />}
      <Icon size={collapsed ? 18 : 16} className="shrink-0" />
      {!collapsed && (
        <>
          <span className="truncate text-sm">{label}</span>
          <span
            className={cn(
              "ml-auto font-mono text-[0.5625rem] tracking-caps tabular-nums",
              active ? "text-accent" : "text-sidebar-foreground/30",
            )}
          >
            {index}
          </span>
        </>
      )}
    </Link>
  );

  return collapsed ? <Tooltip label={label}>{link}</Tooltip> : link;
}

function SidebarFooter({
  collapsed,
  forceExpanded,
  initials,
  name,
  email,
  loading,
  labels,
  onLogout,
  onToggle,
}: {
  collapsed: boolean;
  forceExpanded: boolean;
  initials: string;
  name: string | null | undefined;
  email: string | null | undefined;
  loading: boolean;
  labels: { logOut: string; expand: string; collapse: string };
  onLogout: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="shrink-0 border-t border-sidebar-border p-2.5">
      <div className={cn("flex items-center gap-2", collapsed ? "flex-col" : "px-0.5")}>
        <div className="avatar-sm shrink-0" title={name ?? undefined}>
          {initials}
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-sidebar-foreground">{name}</div>
            <div className="truncate font-mono text-[0.5625rem] tracking-wide text-sidebar-foreground/40">
              {email}
            </div>
          </div>
        )}
        <div className={cn("flex items-center", collapsed ? "flex-col gap-1" : "gap-0.5")}>
          <Tooltip label={labels.logOut}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onLogout}
              disabled={loading}
              aria-label={labels.logOut}
              className="h-7 w-7 text-sidebar-foreground/40 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <LogOut size={13} />
            </Button>
          </Tooltip>
          {!forceExpanded && (
            <Tooltip label={collapsed ? labels.expand : labels.collapse}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onToggle}
                aria-expanded={!collapsed}
                aria-controls="sidebar-nav"
                aria-label={collapsed ? labels.expand : labels.collapse}
                className="h-7 w-7 text-sidebar-foreground/40 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}

export function Sidebar({
  className,
  onNavigate,
  forceExpanded = false,
}: {
  className?: string;
  onNavigate?: () => void;
  forceExpanded?: boolean;
}) {
  const tc = useTranslations("Common");
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut } = useClerk();
  const { user } = useUser();

  useEffect(() => {
    if (!forceExpanded) {
      setIsCollapsed(localStorage.getItem("sidebar-collapsed") === "true");
    }
  }, [forceExpanded]);

  const collapsed = !forceExpanded && isCollapsed;

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

  const renderLink = (link: (typeof NAV_LINKS)[number] | typeof SETTINGS_LINK) => (
    <NavLink
      key={link.href}
      href={link.href}
      label={tc(link.labelKey)}
      icon={link.icon}
      index={link.index}
      active={pathname === link.href || pathname.startsWith(`${link.href}/`)}
      collapsed={collapsed}
      onNavigate={onNavigate}
    />
  );

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-[64px]" : "w-60",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-2" : "px-4",
        )}
      >
        <Link
          href="/dashboard"
          aria-label={tc("dashboard")}
          className="flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <Logo compact showText={false} />
          {!collapsed && (
            <span className="truncate font-display text-lg tracking-[-0.02em] text-sidebar-foreground">
              Topos
            </span>
          )}
        </Link>
      </div>

      <nav
        id="sidebar-nav"
        aria-label={tc("sidebarNavigation")}
        className="flex flex-1 flex-col overflow-y-auto py-3"
      >
        {!collapsed && (
          <p className="mb-2 px-3 micro-caps text-sidebar-foreground/40">{tc("workspace")}</p>
        )}
        <div className={cn("flex flex-col", collapsed ? "px-1.5" : "px-2")}>
          {NAV_LINKS.map(renderLink)}
        </div>

        <div className={cn("mt-auto pt-4", collapsed ? "px-1.5" : "px-2")}>
          <div
            className={cn(
              "mb-2 border-t border-sidebar-border pt-4",
              collapsed ? "mx-1" : "mx-1 px-1",
            )}
          />
          {!collapsed && (
            <p className="mb-2 px-2 micro-caps text-sidebar-foreground/40">{tc("settings")}</p>
          )}
          {renderLink(SETTINGS_LINK)}
        </div>
      </nav>

      <SidebarFooter
        collapsed={collapsed}
        forceExpanded={forceExpanded}
        initials={initials}
        name={user?.fullName || user?.primaryEmailAddress?.emailAddress}
        email={user?.primaryEmailAddress?.emailAddress}
        loading={loading}
        labels={{
          logOut: tc("logOut"),
          expand: tc("expandSidebar"),
          collapse: tc("collapseSidebar"),
        }}
        onLogout={handleLogout}
        onToggle={toggle}
      />
    </aside>
  );
}

"use client";

import { createAuthClient } from "better-auth/react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createContext, useCallback, useContext, useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/common/Logo";

const authClient = createAuthClient({ baseURL: process.env.NEXT_PUBLIC_APP_URL });

import { cn, getInitials } from "@/lib/utils";

type SidebarContextType = { isCollapsed: boolean; toggle: () => void };
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar-collapsed") === "true";
  });
  const toggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  }, []);
  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle }}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider");
  return ctx;
}

function LogoutButton({
  size = 14,
  className = "text-muted-foreground hover:text-foreground transition-colors",
}: {
  size?: number;
  className?: string;
}) {
  const tc = useTranslations("Common");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success(tc("signedOutSuccess"));
            router.push("/sign-in");
            router.refresh();
          },
        },
      });
    } catch {
      toast.error(tc("signOutFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={className}
      title={tc("logOut")}
    >
      <LogOut size={size} className={loading ? "animate-pulse" : ""} />
    </button>
  );
}

type SidebarProps = {
  user: { name: string | null; email: string };
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const tc = useTranslations("Common");
  const { isCollapsed, toggle } = useSidebar();
  const initials = getInitials(user.name, user.email);

  const links = [
    { href: "/dashboard", label: tc("dashboard"), icon: LayoutDashboard },
    { href: "/listings", label: tc("listings"), icon: Home },
    { href: "/transactions", label: tc("transactions"), icon: FileText },
    { href: "/contacts", label: tc("contacts"), icon: Users },
    { href: "/settings", label: tc("settings"), icon: Settings },
  ];

  return (
    <div
      className={cn(
        "border-r border-border bg-background flex flex-col h-full transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!isCollapsed && <Logo />}
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "p-2 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-foreground",
            isCollapsed && "mx-auto",
          )}
          title={isCollapsed ? tc("expandSidebar") : tc("collapseSidebar")}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        {!isCollapsed && (
          <div className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {tc("mainMenu")}
          </div>
        )}
        <nav className="flex-1 flex flex-col mt-2">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                title={isCollapsed ? link.label : undefined}
                className={cn(
                  "flex items-center border-b border-transparent transition-all duration-200 group",
                  isCollapsed ? "justify-center px-2 py-3.5" : "gap-3 px-6 py-3.5",
                  isActive
                    ? "bg-secondary text-foreground font-medium border-border"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Icon
                  size={isCollapsed ? 20 : 16}
                  className={cn(
                    "transition-colors flex-shrink-0",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                {!isCollapsed && (
                  <span className="uppercase tracking-widest text-[11px]">{link.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-2 border-t border-border bg-background">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-foreground flex items-center justify-center text-xs font-bold text-background">
              {initials}
            </div>
            <LogoutButton className="text-muted-foreground hover:text-foreground transition-colors p-2" />
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2 py-2 border border-border/50">
            <div className="w-8 h-8 bg-foreground flex items-center justify-center text-xs font-bold text-background flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-[10px] font-bold uppercase tracking-wider truncate text-foreground">
                {user.name || user.email}
              </div>
              <div className="text-[10px] text-muted-foreground truncate font-mono">
                {user.email}
              </div>
            </div>
            <LogoutButton />
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import {
  Building2,
  CreditCard,
  Palette,
  Shield,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const settingsNav = [
  { href: "/settings", label: "Profile", icon: User, exact: true },
  { href: "/settings/team", label: "Team", icon: Users },
  { href: "/settings/branding", label: "Branding", icon: Palette },
  { href: "/settings/company", label: "Company", icon: Building2 },
  { href: "/settings/notifications", label: "Notifications", icon: Shield },
  { href: "/settings/billing", label: "Billing", icon: CreditCard },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tighter text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground font-light">
          Manage your account and application preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Settings Navigation */}
        <nav className="lg:w-56 flex-shrink-0">
          <div className="border border-border bg-card">
            {settingsNav.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b border-border last:border-b-0",
                    isActive
                      ? "bg-secondary text-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="uppercase tracking-widest text-[11px]">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Settings Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

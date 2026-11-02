"use client";

import { Collapsible } from "@base-ui/react/collapsible";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Logo } from "@/components/common/Logo";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { ThemeControls } from "@/components/ui/mode-toggle";
import { APP_CONFIG } from "@/lib/config";

const LINKS = [
  { href: "/#platform", labelKey: "platform" },
  { href: "/#plans", labelKey: "plans" },
] as const;

export function MarketingHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  const t = useTranslations("Common");
  const [open, setOpen] = useState(false);

  const primaryHref = isLoggedIn ? "/dashboard" : "/sign-up";
  const primaryLabel = isLoggedIn ? t("dashboard") : t("getStarted");

  return (
    <Collapsible.Root
      render={<header className="site-header" />}
      open={open}
      onOpenChange={setOpen}
    >
      <div className="shell flex h-16 items-stretch justify-between gap-6">
        <Link href="/" className="flex items-center py-2" aria-label={APP_CONFIG.name}>
          <Logo tagline={t("tagline")} />
        </Link>

        <nav aria-label={t("mainNavigation")} className="hidden items-stretch lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative flex items-center px-5 meta-caps text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(link.labelKey)}
              <span
                aria-hidden
                className="absolute inset-x-5 bottom-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-200 group-hover:scale-x-100"
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-stretch">
          <LocaleSwitcher className="hidden items-center px-3 sm:flex" />
          {!isLoggedIn && (
            <Link
              href="/sign-in"
              className="hidden items-center px-4 meta-caps text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
            >
              {t("login")}
            </Link>
          )}
          <Link
            href={primaryHref}
            className="group hidden items-center gap-2.5 bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground sm:inline-flex lg:-mr-8"
          >
            {primaryLabel}
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <Collapsible.Trigger
            type="button"
            aria-label={t(open ? "close" : "openMenu")}
            className="ml-1 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Collapsible.Trigger>
        </div>
      </div>

      <Collapsible.Panel className="h-[var(--collapsible-panel-height)] overflow-hidden border-t border-border bg-background transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0 lg:hidden">
        <nav aria-label={t("mainNavigation")} className="shell flex flex-col">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="group flex items-baseline justify-between border-b border-border py-4"
            >
              <span className="font-display text-[1.75rem] tracking-[-0.03em]">
                {t(link.labelKey)}
              </span>
              <ArrowUpRight className="h-4 w-4 -translate-y-0.5 text-muted-foreground transition-colors group-hover:text-accent" />
            </Link>
          ))}
        </nav>

        <div className="shell flex items-center justify-between border-b border-border py-4">
          <LocaleSwitcher />
          <ThemeControls className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground" />
        </div>

        <div className="shell flex flex-col gap-2 py-5">
          {!isLoggedIn && (
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="btn-outline btn-md w-full justify-between"
            >
              {t("login")}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
          <Link
            href={primaryHref}
            onClick={() => setOpen(false)}
            className="btn-primary btn-md w-full justify-between"
          >
            {primaryLabel}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

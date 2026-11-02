import { auth } from "@clerk/nextjs/server";
import { ArrowUp } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Logo } from "@/components/common/Logo";
import { MarketingHeader } from "@/components/common/MarketingHeader";
import { ThemeControls } from "@/components/ui/mode-toggle";
import { APP_CONFIG } from "@/lib/config";

const FOOTER_LINKS = [
  { href: "/#platform", labelKey: "platform" },
  { href: "/#plans", labelKey: "plans" },
  { href: "/privacy", labelKey: "privacy" },
  { href: "/terms", labelKey: "terms" },
  { href: `mailto:${APP_CONFIG.supportEmail}`, labelKey: "contact" },
] as const;

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const [{ userId }, t] = await Promise.all([auth(), getTranslations("Common")]);

  return (
    <div id="top" className="flex min-h-screen flex-col bg-background text-foreground">
      <MarketingHeader isLoggedIn={!!userId} />

      <main className="flex-1">{children}</main>

      <footer className="border-t-2 border-foreground/85">
        <div className="shell grid gap-12 py-14 lg:grid-cols-12 lg:gap-0">
          <div className="lg:col-span-4 lg:pr-10">
            <Link href="/" className="inline-flex" aria-label={APP_CONFIG.name}>
              <Logo tagline={t("tagline")} />
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("footerBlurb")}
            </p>
          </div>

          <nav
            aria-label={t("footerNavigation")}
            className="lg:col-span-5 lg:border-l lg:border-border lg:px-10"
          >
            <p className="label-caps">{t("contents")}</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-8">
              {FOOTER_LINKS.map((link, i) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-baseline gap-3 border-b border-border py-2.5"
                  >
                    <span className="font-mono text-[0.5625rem] tabular-nums tracking-caps text-accent/80">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                      {t(link.labelKey)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col justify-between gap-8 lg:col-span-3 lg:items-end lg:border-l lg:border-border lg:pl-10 lg:text-right">
            <p className="max-w-[15rem] font-mono text-micro uppercase leading-relaxed tracking-caps text-muted-foreground">
              {t("madeFor")}
            </p>
            <ThemeControls className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground" />
          </div>
        </div>

        <div className="shell flex flex-col gap-3 border-t border-border py-5 meta-caps text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {APP_CONFIG.name} — {t("allRightsReserved")}
          </p>
          <a
            href="#top"
            className="group inline-flex items-center gap-2 transition-colors hover:text-foreground"
          >
            {t("backToTop")}
            <ArrowUp className="h-3 w-3 transition-transform group-hover:-translate-y-0.5" />
          </a>
        </div>
      </footer>
    </div>
  );
}

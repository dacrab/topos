import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Logo } from "@/components/common/Logo";
import { ThemeControls } from "@/components/ui/mode-toggle";
import { APP_CONFIG } from "@/lib/config";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations("Auth");

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-foreground p-12 text-background">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Logo className="text-background" inverted />
        </Link>

        <blockquote className="max-w-md space-y-4">
          <p className="text-2xl font-light leading-snug tracking-tight">
            &ldquo;{t("testimonial")}&rdquo;
          </p>
          <footer className="text-sm text-background/60">
            <div className="font-semibold text-background">{t("testimonialAuthor")}</div>
            <div className="uppercase tracking-widest text-xs">{t("testimonialRole")}</div>
          </footer>
        </blockquote>

        <p className="text-xs text-background/40 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} {APP_CONFIG.name}
        </p>
      </div>

      <div className="flex items-center justify-center p-8 bg-background relative">
        <ThemeControls className="absolute top-6 right-6" />
        {children}
      </div>
    </div>
  );
}

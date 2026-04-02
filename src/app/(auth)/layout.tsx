import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Logo } from "@/components/common/Logo";
import { ThemeLocaleControls } from "@/components/ui/language-toggle";
import { APP_CONFIG } from "@/lib/config";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations("Auth");

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-zinc-900 p-12 text-white border-r border-zinc-800">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <Logo className="text-white" />
        </Link>

        <blockquote className="max-w-md space-y-6">
          <p className="text-3xl font-light leading-snug tracking-tight text-zinc-100">
            &ldquo;{t("testimonial")}&rdquo;
          </p>
          <footer className="text-sm text-zinc-400">
            <div className="font-semibold text-white tracking-wide">{t("testimonialAuthor")}</div>
            <div className="uppercase tracking-wider text-xs">{t("testimonialRole")}</div>
          </footer>
        </blockquote>

        <div className="text-xs text-zinc-500 tracking-wider uppercase">
          &copy; {new Date().getFullYear()} {APP_CONFIG.companyName}
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-background relative">
        <ThemeLocaleControls className="absolute top-6 right-6" />
        {children}
      </div>
    </div>
  );
}

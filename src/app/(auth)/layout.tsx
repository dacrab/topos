import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Logo } from "@/components/common/Logo";
import { APP_CONFIG } from "@/lib/config";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const [t, tc] = await Promise.all([getTranslations("Auth"), getTranslations("Common")]);

  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="pointer-events-none absolute inset-0 opacity-[0.14] texture-grid" />
        <div className="pointer-events-none absolute -right-16 top-24 h-[420px] w-[420px] border border-primary-foreground/15" />
        <div className="pointer-events-none absolute -right-16 top-24 h-[420px] w-[420px] translate-x-6 translate-y-6 border border-primary-foreground/[0.07]" />

        <Link href="/" className="relative z-10 inline-flex" aria-label={APP_CONFIG.name}>
          <Logo inverted showText />
        </Link>

        <div className="relative z-10 max-w-md space-y-6 border-l-2 border-accent pl-6">
          <p className="font-display text-2xl leading-snug tracking-[-0.02em] sm:text-3xl">
            &ldquo;{t("testimonial")}&rdquo;
          </p>
          <div className="meta-caps">
            <p className="text-primary-foreground">{t("testimonialAuthor")}</p>
            <p className="mt-1 text-primary-foreground/50">{t("testimonialRole")}</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between meta-caps text-primary-foreground/40">
          <span>τόπος · a sense of place</span>
          <span>
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}
          </span>
        </div>
      </aside>

      <main className="relative flex flex-col">
        <div className="flex items-center justify-between p-6">
          <Link href="/" className="lg:hidden" aria-label={APP_CONFIG.name}>
            <Logo showText />
          </Link>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 border border-border px-3 py-1.5 meta-caps text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            {tc("home")}
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </main>
    </div>
  );
}

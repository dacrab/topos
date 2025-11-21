import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/Logo";
import { LanguageToggle } from "@/components/language-toggle";
import { ModeToggle } from "@/components/mode-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Auth");

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Brand/Marketing */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-900 p-12 text-white border-r border-zinc-800">
        <div className="relative z-10">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Logo className="text-white" />
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <blockquote className="space-y-6">
            <p className="text-3xl font-light leading-snug tracking-tight text-zinc-100">
              &ldquo;{t("testimonial")}&rdquo;
            </p>
            <footer className="text-sm text-zinc-400 flex flex-col gap-1">
              <div className="font-semibold text-white tracking-wide">
                {t("testimonialAuthor")}
              </div>
              <div className="uppercase tracking-wider text-xs">
                {t("testimonialRole")}
              </div>
            </footer>
          </blockquote>
        </div>

        <div className="relative z-10 text-xs text-zinc-500 tracking-wider uppercase">
          &copy; {new Date().getFullYear()} Aether Inc.
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex items-center justify-center p-8 bg-background relative">
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <ModeToggle />
          <LanguageToggle />
        </div>
        {children}
      </div>
    </div>
  );
}

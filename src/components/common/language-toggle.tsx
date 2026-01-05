"use client";

import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useTransition } from "react";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggleLanguage = () => {
    const nextLocale = locale === "en" ? "el" : "en";
    const maxAgeSeconds = 60 * 60 * 24 * 365;

    const cookieStore = (
      window as unknown as {
        cookieStore?: {
          set: (...args: unknown[]) => Promise<void>;
        };
      }
    ).cookieStore;
    if (cookieStore?.set) {
      void cookieStore.set({
        name: "NEXT_LOCALE",
        value: nextLocale,
        expires: new Date(Date.now() + maxAgeSeconds * 1000),
        path: "/",
        sameSite: "lax",
      });
    } else {
      // biome-ignore lint/suspicious/noDocumentCookie: Fallback for browsers without Cookie Store API support.
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
    }

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      disabled={isPending}
      className="relative inline-flex h-9 items-center justify-center rounded-full px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <Globe className="mr-2 h-4 w-4" />
      <span className="uppercase text-xs tracking-wider">{locale}</span>
    </button>
  );
}

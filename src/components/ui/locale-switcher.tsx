"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();

  const toggle = () => {
    const next = locale === "en" ? "el" : "en";
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000`;
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={className || "p-2 hover:bg-muted"}
      aria-label="Switch language"
    >
      <span className="text-xs font-bold uppercase tracking-wider">
        {locale === "en" ? "EL" : "EN"}
      </span>
    </button>
  );
}

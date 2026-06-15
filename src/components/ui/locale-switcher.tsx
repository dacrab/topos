"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();

  const toggle = () => {
    const next = locale === "en" ? "el" : "en";
    // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API not available; next-intl uses this cookie approach
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000`;
    router.refresh();
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={className}
      aria-label="Switch language"
    >
      <span className="text-xs font-semibold">{locale === "en" ? "EL" : "EN"}</span>
    </Button>
  );
}

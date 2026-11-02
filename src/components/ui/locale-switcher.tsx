"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Fragment } from "react";
import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "en", label: "English" },
  { code: "el", label: "Ελληνικά" },
] as const;

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("Common");
  const router = useRouter();

  const select = (next: string) => {
    if (next === locale) return;
    // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store API not available; next-intl uses this cookie approach
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000`;
    router.refresh();
  };

  return (
    <fieldset
      aria-label={t("switchLanguage")}
      className={cn("m-0 flex min-w-0 items-center gap-1.5 border-0 p-0 meta-caps", className)}
    >
      {LOCALES.map(({ code, label }, index) => (
        <Fragment key={code}>
          {index > 0 && (
            <span aria-hidden className="text-muted-foreground/40">
              /
            </span>
          )}
          <button
            type="button"
            lang={code}
            aria-label={label}
            aria-pressed={locale === code}
            onClick={() => select(code)}
            className={cn(
              "px-0.5 py-1 transition-colors",
              locale === code ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {code.toUpperCase()}
          </button>
        </Fragment>
      ))}
    </fieldset>
  );
}

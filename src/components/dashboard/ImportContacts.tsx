"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function ImportContacts() {
  const t = useTranslations("Contacts");
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async () => {
    const file = inputRef.current?.files?.[0];
    if (!file) return;
    setLoading(true);
    setResult(null);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/import/contacts", { method: "POST", body: form });
    const data = await res.json();
    setResult(data);
    setLoading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input ref={inputRef} type="file" accept=".csv" className="text-sm" />
      <Button type="button" variant="outline" size="sm" onClick={upload} disabled={loading}>
        {loading ? t("importing") : t("importCsv")}
      </Button>
      {result && (
        <span className="text-xs text-muted-foreground">
          {t("importedCount", { count: result.imported })}
          {result.errors.length > 0 && `, ${t("errorsCount", { count: result.errors.length })}`}
        </span>
      )}
    </div>
  );
}

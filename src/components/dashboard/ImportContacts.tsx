"use client";

import { FileUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ImportContacts() {
  const t = useTranslations("Contacts");
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setLoading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/import/contacts", { method: "POST", body: form });
      if (!res.ok) throw new Error(t("importFailed"));
      const data: { imported: number; errors: string[] } = await res.json();
      setResult(data);
    } catch {
      setResult({ imported: 0, errors: [t("importFailed")] });
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        <FileUp className="h-3.5 w-3.5" />
        {loading ? t("importing") : t("importCsv")}
      </Button>
      {result && (
        <Badge variant={result.errors.length > 0 ? "warning" : "success"}>
          {t("importedCount", { count: result.imported })}
          {result.errors.length > 0 && ` · ${t("errorsCount", { count: result.errors.length })}`}
        </Badge>
      )}
    </div>
  );
}

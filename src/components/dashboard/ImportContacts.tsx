"use client";

import { useRef, useState } from "react";

export function ImportContacts() {
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
      <button
        type="button"
        onClick={upload}
        disabled={loading}
        className="px-3 py-1.5 text-xs font-medium border rounded hover:bg-muted disabled:opacity-50"
      >
        {loading ? "Importing..." : "Import CSV"}
      </button>
      {result && (
        <span className="text-xs text-muted-foreground">
          {result.imported} imported{result.errors.length > 0 && `, ${result.errors.length} errors`}
        </span>
      )}
    </div>
  );
}

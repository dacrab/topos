"use client";

import el from "../../messages/el.json";
import en from "../../messages/en.json";

function getT() {
  const locale =
    typeof document !== "undefined"
      ? (document.cookie.match(/NEXT_LOCALE=(\w+)/)?.[1] ?? "en")
      : "en";
  const msgs = locale === "el" ? el : en;
  return msgs.Common;
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = getT();

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a] text-[#fafafa] flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-6">
          <div className="inline-block border border-red-500/30 bg-red-500/10 px-4 py-2">
            <span className="font-mono text-xs font-bold tracking-widest text-red-400">
              {t.fatalError}
              {error.digest ? `: ${error.digest}` : ""}
            </span>
          </div>
          <h1 className="text-5xl font-bold tracking-tighter">{t.somethingBroke}</h1>
          <p className="text-[#a1a1aa]">{t.fatalDesc}</p>
          <div className="flex gap-3 justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center border border-[#27272a] px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#27272a]"
            >
              {t.errorGoHome}
            </a>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center bg-[#fafafa] text-[#0a0a0a] px-6 py-3 text-xs font-bold uppercase tracking-widest hover:opacity-90"
            >
              {t.tryAgain}
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

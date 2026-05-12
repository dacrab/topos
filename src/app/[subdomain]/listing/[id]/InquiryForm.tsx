"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export function InquiryForm({ listingId, subdomain }: { listingId: string; subdomain: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const t = useTranslations("PublicSite");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId,
        subdomain,
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        message: form.get("message"),
      }),
    });

    setStatus(res.ok ? "success" : "error");
  }

  if (status === "success") {
    return (
      <div className="border border-border p-6 text-center">
        <p className="font-bold text-green-600">{t("thankYou")}</p>
        <p className="text-sm text-muted-foreground mt-1">{t("inTouchSoon")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        name="name"
        type="text"
        required
        placeholder={t("fullName")}
        className="w-full border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />
      <input
        name="email"
        type="email"
        required
        placeholder={t("email")}
        className="w-full border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />
      <input
        name="phone"
        type="tel"
        placeholder={t("phone")}
        className="w-full border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />
      <textarea
        name="message"
        rows={3}
        placeholder={t("message")}
        className="w-full border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-primary py-3 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {status === "loading" ? t("sending") : t("sendInquiry")}
      </button>
      {status === "error" && <p className="text-sm text-red-600">{t("inquiryError")}</p>}
    </form>
  );
}

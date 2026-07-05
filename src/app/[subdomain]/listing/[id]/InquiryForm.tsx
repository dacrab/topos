"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

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
      <div className="border border-border rounded-2xl p-6 text-center">
        <p className="font-bold text-green-600">{t("thankYou")}</p>
        <p className="text-sm text-muted-foreground mt-1">{t("inTouchSoon")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input name="name" required placeholder={t("fullName")} />
      <Input name="email" type="email" required placeholder={t("email")} />
      <Input name="phone" type="tel" placeholder={t("phone")} />
      <Textarea name="message" rows={3} placeholder={t("message")} />
      <Button
        type="submit"
        variant="default"
        size="lg"
        disabled={status === "loading"}
        className="w-full"
      >
        {status === "loading" ? t("sending") : t("sendInquiry")}
      </Button>
      {status === "error" && <p className="text-sm text-red-600">{t("inquiryError")}</p>}
    </form>
  );
}

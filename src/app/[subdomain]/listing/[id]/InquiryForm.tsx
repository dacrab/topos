"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/form";
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
      <div className="border border-success/30 p-6 text-center">
        <span className="mx-auto mb-3 flex h-9 w-9 items-center justify-center border border-success text-success">
          <Check className="h-4 w-4" />
        </span>
        <p className="meta-caps text-success">{t("thankYou")}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t("inTouchSoon")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="inquiry-name">{t("fullName")}</Label>
        <Input id="inquiry-name" name="name" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="inquiry-email">{t("email")}</Label>
        <Input id="inquiry-email" name="email" type="email" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="inquiry-phone">{t("phone")}</Label>
        <Input id="inquiry-phone" name="phone" type="tel" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="inquiry-message">{t("message")}</Label>
        <Textarea id="inquiry-message" name="message" rows={3} />
      </div>
      <Button
        type="submit"
        variant="default"
        size="lg"
        disabled={status === "loading"}
        className="w-full"
      >
        {status === "loading" ? t("sending") : t("sendInquiry")}
      </Button>
      {status === "error" && <p className="text-sm text-destructive">{t("inquiryError")}</p>}
    </form>
  );
}

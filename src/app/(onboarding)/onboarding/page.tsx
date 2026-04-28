"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/form";
import { Input, Textarea } from "@/components/ui/input";
import { APP_CONFIG } from "@/lib/config";
import { completeOnboarding } from "./actions";

type Step = "agency" | "office" | "complete";

export default function OnboardingPage() {
  const t = useTranslations("Onboarding");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>("agency");
  const [form, setForm] = useState({
    agencyName: "",
    slug: "",
    phone: "",
    email: "",
    address: "",
    website: "",
  });

  const update = (field: keyof typeof form, value: string) => {
    const next = { ...form, [field]: value };
    if (field === "agencyName") {
      next.slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
    setForm(next);
  };

  const submit = (data: typeof form) => {
    startTransition(async () => {
      const result = await completeOnboarding(data);
      if (result.success) {
        setStep("complete");
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        toast.error(result.message || t("saveFailed"));
      }
    });
  };

  const handleNext = () => {
    if (step === "agency") {
      if (!form.agencyName.trim()) return toast.error(t("agencyNameRequired"));
      if (!form.slug.trim()) return toast.error(t("slugRequired"));
      setStep("office");
    } else {
      submit(form);
    }
  };

  if (step === "complete") {
    return (
      <div className="w-full max-w-md text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 mx-auto text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">{t("allSet")}</h1>
        <p className="text-muted-foreground">{t("redirecting")}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="flex items-center justify-center gap-2">
        <div className={`w-2 h-2 ${step === "agency" ? "bg-primary" : "bg-muted-foreground"}`} />
        <div className="w-8 h-px bg-border" />
        <div className={`w-2 h-2 ${step === "office" ? "bg-primary" : "bg-muted-foreground"}`} />
      </div>

      {step === "agency" && (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">{t("welcomeTitle")}</h1>
            <p className="text-muted-foreground mt-1">{t("welcomeSubtitle")}</p>
          </div>

          <div className="border border-border p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agencyName">{t("agencyName")}</Label>
              <Input
                id="agencyName"
                value={form.agencyName}
                onChange={(e) => update("agencyName", e.target.value)}
                placeholder={t("agencyNamePlaceholder")}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">{t("subdomain")}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) =>
                    update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                  }
                  placeholder="my-agency"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  .{APP_CONFIG.domain.replace(/:\d+$/, "")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{t("subdomainHint")}</p>
            </div>
          </div>

          <Button onClick={handleNext} variant="submit" size="auto" className="w-full">
            {t("continue")} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {step === "office" && (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">{t("officeTitle")}</h1>
            <p className="text-muted-foreground mt-1">{t("officeSubtitle")}</p>
          </div>

          <div className="border border-border p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder={t("phonePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder={t("emailPlaceholder")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">{t("website")}</Label>
              <Input
                id="website"
                type="url"
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                placeholder={t("websitePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">{t("address")}</Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder={t("addressPlaceholder")}
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="auto"
              className="flex-1 py-3"
              disabled={isPending}
              onClick={() => submit({ ...form, phone: "", email: "", address: "", website: "" })}
            >
              {t("skipForNow")}
            </Button>
            <Button
              type="button"
              variant="submit"
              size="auto"
              className="flex-1 py-3"
              disabled={isPending}
              onClick={handleNext}
            >
              {isPending ? t("saving") : t("complete")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

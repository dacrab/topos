"use client";

import { ArrowRight, CheckCircle2, Compass } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/form";
import { Input, Textarea } from "@/components/ui/input";
import { rootDomainWithoutPort } from "@/lib/config";
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
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-success" />
        </div>
        <div>
          <h1 className="page-title text-foreground">{t("allSet")}</h1>
          <p className="text-muted-foreground mt-2">{t("redirecting")}</p>
        </div>
        <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
          <div className="bg-primary h-1 w-full rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg space-y-8">
      <div
        className="flex items-center justify-center gap-3"
        role="tablist"
        aria-label="Onboarding steps"
      >
        <div className="flex items-center gap-2">
          <div
            role="tab"
            aria-selected={step === "agency" || step === "office"}
            tabIndex={0}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${
              step === "agency" || step === "office"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            1
          </div>
          <div
            className={`h-0.5 w-10 rounded-full transition-colors ${
              step === "office" ? "bg-primary" : "bg-border"
            }`}
          />
          <div
            role="tab"
            aria-selected={step === "office"}
            tabIndex={0}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${
              step === "office"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            2
          </div>
        </div>
      </div>

      {step === "agency" && (
        <div className="card-base">
          <div className="p-8 space-y-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Compass className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h1 className="page-title text-foreground">{t("welcomeTitle")}</h1>
              <p className="text-muted-foreground mt-2">{t("welcomeSubtitle")}</p>
            </div>

            <div className="space-y-5">
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
                    .{rootDomainWithoutPort()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{t("subdomainHint")}</p>
              </div>
            </div>

            <Button type="button" variant="default" onClick={handleNext} className="w-full">
              {t("continue")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {step === "office" && (
        <div className="card-base">
          <div className="p-8 space-y-8">
            <div className="text-center">
              <h1 className="page-title text-foreground">{t("officeTitle")}</h1>
              <p className="text-muted-foreground mt-2">{t("officeSubtitle")}</p>
            </div>

            <div className="space-y-5">
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
                disabled={isPending}
                onClick={() => submit({ ...form, phone: "", email: "", address: "", website: "" })}
                className="flex-1"
              >
                {t("skipForNow")}
              </Button>
              <Button
                type="button"
                variant="default"
                disabled={isPending}
                onClick={handleNext}
                className="flex-1"
              >
                {isPending ? t("saving") : t("complete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { ArrowRight, Building2, CheckCircle2, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_CONFIG } from "@/lib/config";
import { completeOnboarding } from "./actions";

type Step = "agency" | "office" | "complete";

export default function OnboardingPage() {
  const t = useTranslations("Onboarding");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>("agency");

  const [formData, setFormData] = useState({
    agencyName: "",
    slug: "",
    phone: "",
    email: "",
    address: "",
    website: "",
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "agencyName") {
        next.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      }
      return next;
    });
  };

  const submit = (data: typeof formData) => {
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
      if (!formData.agencyName.trim()) {
        toast.error(t("agencyNameRequired"));
        return;
      }
      if (!formData.slug.trim()) {
        toast.error(t("slugRequired"));
        return;
      }
      setStep("office");
    } else if (step === "office") {
      submit(formData);
    }
  };

  const handleSkip = () => {
    submit({ ...formData, phone: "", email: "", address: "", website: "" });
  };

  if (step === "complete") {
    return (
      <div className="w-full max-w-md text-center space-y-6 animate-in fade-in zoom-in-95">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{t("allSet")}</h1>
        <p className="text-muted-foreground">{t("redirecting")}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${step === "agency" ? "bg-primary" : "bg-primary/30"}`}
        />
        <div className="w-8 h-px bg-border" />
        <div
          className={`w-3 h-3 rounded-full ${step === "office" ? "bg-primary" : "bg-primary/30"}`}
        />
      </div>

      {step === "agency" && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{t("welcomeTitle")}</h1>
            <p className="text-muted-foreground">{t("welcomeSubtitle")}</p>
          </div>

          <div className="space-y-4 bg-card border border-border p-6">
            <div className="space-y-2">
              <Label htmlFor="agencyName">{t("agencyName")}</Label>
              <Input
                id="agencyName"
                type="text"
                value={formData.agencyName}
                onChange={(e) => updateField("agencyName", e.target.value)}
                placeholder={t("agencyNamePlaceholder")}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">{t("subdomain")}</Label>
              <div className="flex items-center">
                <Input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    updateField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                  }
                  placeholder="my-agency"
                />
                <span className="ml-2 text-sm text-muted-foreground whitespace-nowrap">
                  .{APP_CONFIG.domain.replace(/:\d+$/, "")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{t("subdomainHint")}</p>
            </div>
          </div>

          <Button onClick={handleNext} variant="submit" size="auto" className="w-full">
            {t("continue")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {step === "office" && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{t("officeTitle")}</h1>
            <p className="text-muted-foreground">{t("officeSubtitle")}</p>
          </div>

          <div className="space-y-4 bg-card border border-border p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder={t("phonePlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder={t("emailPlaceholder")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">{t("website")}</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => updateField("website", e.target.value)}
                placeholder={t("websitePlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t("address")}</Label>
              <Textarea
                id="address"
                rows={2}
                value={formData.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder={t("addressPlaceholder")}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSkip}
              variant="outline"
              size="auto"
              className="flex-1"
              disabled={isPending}
            >
              {t("skipForNow")}
            </Button>
            <Button
              onClick={handleNext}
              variant="submit"
              size="auto"
              className="flex-1"
              disabled={isPending}
            >
              {isPending ? t("saving") : t("complete")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

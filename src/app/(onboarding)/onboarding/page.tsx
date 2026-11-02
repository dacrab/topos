"use client";

import { ArrowRight, Building2, Check, CheckCircle2, Compass } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/form";
import { Input, Textarea } from "@/components/ui/input";
import { rootDomainWithoutPort } from "@/lib/config";
import { cn } from "@/lib/utils";
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
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center border border-success text-success">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="page-title mt-6 text-foreground">{t("allSet")}</h1>
        <p className="mt-2 text-muted-foreground">{t("redirecting")}</p>
        <div className="mx-auto mt-8 h-1 w-48 overflow-hidden bg-muted">
          <div className="h-full w-2/3 animate-pulse bg-accent" />
        </div>
      </div>
    );
  }

  const isAgency = step === "agency";

  return (
    <div>
      <ol
        className="mb-6 flex items-center gap-3 border-b border-border pb-4"
        aria-label={t("progressLabel")}
      >
        {(["agency", "office"] as const).map((item, index) => {
          const active = step === item;
          const done = item === "agency" && step === "office";
          return (
            <li
              key={item}
              aria-current={active ? "step" : undefined}
              className="flex items-center gap-2.5"
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center border font-mono text-micro transition-colors",
                  active || done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span
                className={cn("meta-caps", active ? "text-foreground" : "text-muted-foreground")}
              >
                {t(item === "agency" ? "stepAgency" : "stepOffice")}
              </span>
              {index === 0 && <span className="mx-2 h-px w-8 bg-border" aria-hidden />}
            </li>
          );
        })}
      </ol>

      <div className="border-t-2 border-foreground/85 bg-card">
        <div className="border-b border-border px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-border text-accent">
              {isAgency ? <Compass className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
            </span>
            <div>
              <p className="label-caps mb-1">
                {t("stepCount", { current: isAgency ? 1 : 2, total: 2 })}
              </p>
              <h1 className="card-title text-foreground">
                {isAgency ? t("welcomeTitle") : t("officeTitle")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isAgency ? t("welcomeSubtitle") : t("officeSubtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6 sm:p-7">
          {isAgency ? (
            <>
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
                <div className="flex items-stretch">
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) =>
                      update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                    }
                    placeholder="my-agency"
                    className="border-r-0"
                  />
                  <span className="flex items-center whitespace-nowrap border border-l-0 border-input bg-muted px-3 font-mono text-xs text-muted-foreground">
                    .{rootDomainWithoutPort()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{t("subdomainHint")}</p>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border px-6 py-4 sm:flex-row sm:justify-end">
          {isAgency ? (
            <Button
              type="button"
              variant="default"
              onClick={handleNext}
              className="w-full sm:w-auto"
            >
              {t("continue")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                disabled={isPending}
                onClick={() => submit({ ...form, phone: "", email: "", address: "", website: "" })}
              >
                {t("skipForNow")}
              </Button>
              <Button type="button" variant="default" disabled={isPending} onClick={handleNext}>
                {isPending ? t("saving") : t("complete")}
                {!isPending && <ArrowRight className="h-4 w-4" />}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
